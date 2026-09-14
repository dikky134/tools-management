import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { supabase } from './lib/supabase';
import {
  getCurrentSessionUser,
  getProfile,
  signIn as authSignIn,
  signOut as authSignOut,
} from './services/auth.service';
import type { AppState, User, Tool, ToolCategory, Borrowing, MaintenanceRequest, DamageReport, Notification, ActivityLog, ToolCondition, Priority, MaintenanceStatus, RepairResult, MechanicAvailability } from './types';
import { users as seedUsers, tools as seedTools, categories as seedCategories, borrowings as seedBorrowings, maintenanceRequests as seedMaintenance, damageReports as seedDamage, notifications as seedNotifications, activityLogs as seedLogs } from './data';
import { getTools, createTool, updateTool as updateToolService } from './services/tools.service';
import { getCategories, createCategory, updateCategory as updateCategoryService, deleteCategory as deleteCategoryService } from './services/categories.service';
import { getMyNotifications } from './services/notification.service';
import { getMyBorrowings, getAllBorrowings, borrowTool as borrowToolFromService, returnTool as returnToolFromService, } from './services/borrowings.sevice';
import { 
  createMaintenanceRequest as createMaintenanceService,
  assignMechanic as assignMechanicService,
  startMaintenance,
  updateMaintenanceStatus,
  completeMaintenance,
  getMaintenanceRequests,
  getMyMaintenanceTasks, } from './services/maintenance.service';
import { 
  getUsers, 
  createUser, 
  updateUser as updateUserService, 
  updateUserStatus,
  updateMyProfile
} from './services/users.service';
import {
  reportDamage as reportDamageService,
  getDamageReports,
} from './services/damage.service';
import { getActivityLogs } from './services/activity.service';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from './services/notification.service';
import {
  subscribeToToolChanges,
  subscribeToBorrowingChanges,
  subscribeToMaintenanceChanges,
  subscribeToProfileChanges,
  subscribeToNotificationChanges,
  subscribeToDamageChanges,
} from './services/realtime.service';
import {
  updateMyMechanicStatus,
  getActiveMechanics,
} from './services/mechanics.service';

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authLoading: boolean;
  dataLoading: boolean;
  borrowTool: (toolId: string, purpose: string, durationMinutes: number) => Promise<void>;
  returnTool: (borrowingId: string, condition: ToolCondition, notes?: string) => Promise<void>;
  reportDamage: (toolId: string, reportedBy: string, damageType: string, description: string, priority: Priority) => Promise<void>;
  createMaintenanceRequest: (toolId: string, reportedBy: string, description: string, priority: Priority) => Promise<string>;
  assignMechanic: (maintenanceId: string, mechanicId: string) => Promise<void>;
  startTask: (maintenanceId: string) => Promise<void>;
  updateTaskStatus: (maintenanceId: string, status: MaintenanceStatus, notes?: string) => Promise<void>;
  completeTask: (maintenanceId: string, result: RepairResult, notes: string, cost: number, parts: string) => Promise<void>;
  updateMechanicStatus: (userId: string, status: MechanicAvailability) => Promise<void>;
  addTool: (tool: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTool: (id: string, updates: Partial<Tool>) => Promise<void>;
  addCategory: (cat: Omit<ToolCategory, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<ToolCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  updateUserStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllRead: (userId: string) => Promise<void>;
  updateMyProfile: (fullName: string, phone: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function addLog(logs: ActivityLog[], userId: string, action: string, entity: string, entityId: string, description: string): ActivityLog[] {
  return [{
    id: genId('log'), userId, action, entity, entityId, description,
    createdAt: new Date().toISOString(),
  }, ...logs];
}

function addNotif(notifs: Notification[], userId: string, type: Notification['type'], title: string, message: string): Notification[] {
  return [{
    id: genId('notif'), userId, type, title, message,
    read: false, createdAt: new Date().toISOString(),
  }, ...notifs];
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const loadRequestIdRef = useRef(0);
  const [state, setState] = useState<AppState>({
    currentUser: null,
    users: [],
    mechanics: [],
    tools: seedTools,
    categories: seedCategories,
    borrowings: seedBorrowings,
    maintenanceRequests: seedMaintenance,
    damageReports: [],
    notifications: seedNotifications,
    activityLogs: seedLogs,
  });

  const currentUserId = state.currentUser?.id;
  const currentUserRole = state.currentUser?.role;

  const updateMyProfile = useCallback(
    async (
      fullName: string,
      phone: string,
    ) => {
      await updateMyProfileService(
        fullName,
        phone,
      );

      const user = await getProfile(
        currentUserId!,
      );

      setState(prev => ({
        ...prev,
        currentUser: user,
      }));
    },
    [currentUserId],
  );

  const loadApplicationData = useCallback(
    async () => {
      const requestId = ++loadRequestIdRef.current;
      setDataLoading(true);

      try {
        if (!currentUserId || !currentUserRole) {
          return;
        }

        const mechanics = await getActiveMechanics();

        const [
          users,
          tools,
          categories,
          borrowings,
          maintenanceRequests,
          damageReports,
          notifications,
          activityLogs,
        ] = await Promise.all([
          getUsers(),
          getTools(),
          getCategories(),

          currentUserRole === 'ADMIN'
            ? getAllBorrowings()
            : getMyBorrowings(),

          currentUserRole === 'ADMIN'
            ? getMaintenanceRequests()
            : getMyMaintenanceTasks(),

          getDamageReports(),
          getMyNotifications(),

          currentUserRole === 'ADMIN'
            ? getActivityLogs()
            : Promise.resolve([]),
        ]);

        if (requestId !== loadRequestIdRef.current) {
          return;
        }

        setState(prev => {

          const updatedCurrentUser =
            prev.currentUser
              ? users.find(
                  user => user.id === prev.currentUser?.id
                ) ?? prev.currentUser
              : null;

          return {
            ...prev,
            currentUser: updatedCurrentUser,
            users,
            mechanics,
            tools,
            categories,
            borrowings,
            maintenanceRequests,
            damageReports,
            notifications,
            activityLogs,
          };
        });
      } catch (error) {
        console.error(
          'Failed to load application data:',
          error
        );
      } finally {
        setDataLoading(false);
      }
    },
    [currentUserId, currentUserRole],
  );

  const login = useCallback(async (email: string, password: string) => {
    const user = await authSignIn(email, password);

    if (user.status !== 'ACTIVE') {
      await authSignOut();
      throw new Error('Your account is inactive.');
    }

    setState(prev => ({
      ...prev,
      currentUser: user,
    }));
  }, []);

  const logout = useCallback(async () => {
    await authSignOut();

    setState(prev => ({
      ...prev,
      currentUser: null,
    }));
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const channel = supabase
      .channel('mechanic-status-global')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mechanic_statuses',
        },
        async payload => {
          console.log(
            'MECHANIC STATUS REALTIME:',
            payload
          );

          try {
            const mechanics = await getActiveMechanics();

            setState(prev => ({
              ...prev,
              mechanics,
            }));
          } catch (error) {
            console.error(
              'Failed to refresh mechanic statuses:',
              error
            );
          }
        }
      )
      .subscribe(status => {
        console.log(
          'Mechanic status subscription:',
          status
        );
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const user = await getCurrentSessionUser();

        if (!mounted) return;

        setState(prev => ({
          ...prev,
          currentUser: user,
        }));
      } catch (error) {
        console.error('Failed to restore authentication session:', error);

        if (mounted) {
          setState(prev => ({
            ...prev,
            currentUser: null,
          }));
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setState(prev => ({
          ...prev,
          currentUser: null,
        }));

        return;
      }

      if (
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'INITIAL_SESSION'
      ) {
        setTimeout(async () => {
          try {
            const user = await getProfile(session.user.id);

            if (!mounted) return;

            setState(prev => ({
              ...prev,
              currentUser: user,
            }));
          } catch (error) {
            console.error('Failed to load user profile:', error);
          } finally {
            if (mounted) {
              setAuthLoading(false);
            }
          }
        }, 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      const notifications = await getMyNotifications();

      setState(prev => ({
        ...prev,
        notifications,
      }));
    } catch (error) {
      console.error(
        'Failed to refresh notifications:',
        error,
      );
    }
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    void loadApplicationData();
  }, [currentUserId, loadApplicationData]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const cleanupTools =
      subscribeToToolChanges(() => {
        void loadApplicationData();
      });

    const cleanupBorrowings =
      subscribeToBorrowingChanges(() => {
        void loadApplicationData();
      });

    const cleanupMaintenance =
      subscribeToMaintenanceChanges(() => {
        void loadApplicationData();
      });

    const cleanupProfiles =
      subscribeToProfileChanges(() => {
        void loadApplicationData();
      });

    const cleanupNotifications =
      subscribeToNotificationChanges(
        currentUserId,
        () => {
          void refreshNotifications();
        },
      );

    const cleanupDamage =
      subscribeToDamageChanges(() => {
        void loadApplicationData();
      });

    return () => {
      cleanupTools();
      cleanupBorrowings();
      cleanupMaintenance();
      cleanupProfiles();
      cleanupNotifications();
      cleanupDamage();
    };
    }, [
    currentUserId,
    loadApplicationData,
    refreshNotifications,
    ]);

  const handleBorrowTool = useCallback(
    async (
      toolId: string,
      purpose: string,
      durationMinutes: number,
    ) => {
      await borrowToolFromService(
        toolId,
        purpose,
        durationMinutes,
      );

      await loadApplicationData();
    },
    [loadApplicationData],
  );

  const handleReturnTool = useCallback(
    async (
      borrowingId: string,
      condition: 'GOOD' | 'MINOR_DAMAGE' | 'DAMAGED',
      notes?: string,
    ) => {
      await returnToolFromService(
        borrowingId,
        condition,
        notes,
      );

      await loadApplicationData();
    },
    [loadApplicationData],
  );

  const reportDamage = useCallback(
    async (
      toolId: string,
      damageType: string,
      description: string,
      priority: Priority,
      photoUrl?: string,
    ) => {
      console.log('REPORT DAMAGE CALLED', {
        toolId,
        damageType,
        description,
        priority,
      });

      await reportDamageService(
        toolId,
        damageType,
        description,
        priority,
        photoUrl,
      );

      await loadApplicationData();
    },
    [loadApplicationData],
  );

  const createMaintenanceRequest = useCallback(
    async (
      toolId: string,
      description: string,
      priority: Priority,
    ) => {
      const id =
        await createMaintenanceService(
          toolId,
          description,
          priority,
        );

      await loadApplicationData();

      return id;
    },
    [loadApplicationData],
  );

  const assignMechanic = useCallback(
    async (
      maintenanceId: string,
      mechanicId: string,
    ) => {
      await assignMechanicService(
        maintenanceId,
        mechanicId,
      );

      await loadApplicationData();
    },
    [loadApplicationData],
  );

  const startTask = useCallback(
    async (
      maintenanceId: string,
    ) => {
      await startMaintenance(
        maintenanceId,
      );

      await loadApplicationData();
    },
    [loadApplicationData],
  );

  const updateTaskStatus = useCallback(
    async (
      maintenanceId: string,
      status: MaintenanceStatus,
      notes?: string,
    ) => {
      await updateMaintenanceStatus(
        maintenanceId,
        status,
        notes,
      );

      await loadApplicationData();
    },
    [loadApplicationData],
  );

  const completeTask = useCallback(
    async (
      maintenanceId: string,
      result: RepairResult,
      notes: string,
      cost: number,
      parts: string,
    ) => {
      await completeMaintenance(
        maintenanceId,
        result,
        notes,
        cost,
        parts,
      );

      await loadApplicationData();
    },
    [loadApplicationData],
  );

  const updateMechanicStatus = useCallback(
    async (
      _userId: string,
      status: MechanicAvailability,
    ) => {
      if (
        status !== 'AVAILABLE' &&
        status !== 'OFF_DUTY'
      ) {
        throw new Error(
          'BUSY status is managed automatically.',
        );
      }

      await updateMyMechanicStatus(status);

      // Update status mechanic yang sedang login
      setState(prev => ({
        ...prev,
        currentUser: prev.currentUser
          ? {
              ...prev.currentUser,
              mechanicStatus: status,
            }
          : null,
        mechanics: prev.mechanics.map(mechanic =>
          mechanic.id === prev.currentUser?.id
            ? {
                ...mechanic,
                mechanic_status: status,
              }
            : mechanic,
        ),
      }));
    },
    [],
  );
  
  const addTool = useCallback(
      async (
        tool: Omit<
          Tool,
          'id' | 'createdAt' | 'updatedAt'
        >,
      ) => {
        await createTool(tool);
        await loadApplicationData();
      },
      [loadApplicationData],
    );

  const updateTool = useCallback(
    async (
      id: string,
      updates: Partial<Tool>,
    ) => {
      await updateToolService(id, updates);
      await loadApplicationData();
    },
    [loadApplicationData],
  );

  const addCategory = useCallback(
    async (
      category: Omit<ToolCategory, 'id'>,
    ) => {
      await createCategory(category);
      await loadApplicationData();
    },
    [loadApplicationData],
  );

  const updateCategory = useCallback(
    async (
      id: string,
      updates: Partial<ToolCategory>,
    ) => {
      await updateCategoryService(
        id,
        updates,
      );

      await loadApplicationData();
    },
    [loadApplicationData],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      await deleteCategoryService(id);
      await loadApplicationData();
    },
    [loadApplicationData],
  );

  const addUser = useCallback(
    async (
      user: Omit<User, 'id' | 'createdAt'>,
    ) => {
      await createUser(user);

      const users = await getUsers();

      setState(prev => ({
        ...prev,
        users,
      }));
    },
    [],
  );

  const updateUser = useCallback(
    async (
      id: string,
      updates: Partial<User>,
    ) => {
      await updateUserService(
        id,
        updates,
      );

      const users = await getUsers();

      setState(prev => ({
        ...prev,
        users,
        currentUser:
          prev.currentUser?.id === id
            ? users.find(
                user => user.id === id,
              ) ?? prev.currentUser
            : prev.currentUser,
      }));
    },
    [],
  );

  const handleMarkNotificationRead =
    useCallback(
      async (id: string) => {
        await markNotificationAsRead(id);

        await loadApplicationData();
      },
      [loadApplicationData],
    );

  const handleMarkAllRead =
    useCallback(
      async (userId: string) => {
        await markAllNotificationsAsRead();

        await loadApplicationData();
      },
      [loadApplicationData],
    );

  const updateUserStatusHandler =
  useCallback(
    async (
      id: string,
      status: 'ACTIVE' | 'INACTIVE',
    ) => {
      await updateUserStatus(
        id,
        status,
      );

      const users = await getUsers();

      setState(prev => ({
        ...prev,
        users,
        currentUser:
          prev.currentUser?.id === id
            ? users.find(
                user => user.id === id,
              ) ?? prev.currentUser
            : prev.currentUser,
      }));
    },
    [],
  );

  return (
    <AppContext.Provider
      value={{
        ...state,

        login,
        logout,
        authLoading,
        dataLoading,

        borrowTool:
          handleBorrowTool,
        returnTool:
          handleReturnTool,
        reportDamage,
        createMaintenanceRequest,
        assignMechanic,
        startTask,
        updateTaskStatus,
        completeTask,
        updateMechanicStatus,
        addTool,
        updateTool,
        addCategory,
        updateCategory,
        deleteCategory,

        addUser,
        updateUser,

        markNotificationRead:
          handleMarkNotificationRead,
        markAllRead:
          handleMarkAllRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
