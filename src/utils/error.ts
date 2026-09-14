export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === 'string') {
      return message;
    }
  }

  return 'Something went wrong. Please try again.';
}

export function getUserFriendlyError(error: unknown): string {
  const message = getErrorMessage(error).trim();

  if (!message) {
    return 'Something went wrong. Please try again.';
  }

  const normalized = message.toLowerCase();

  if (normalized.includes('authentication required')) {
    return 'Your session has expired. Please log in again.';
  }

  if (normalized.includes('user is inactive')) {
    return 'Your account is inactive. Please contact the administrator.';
  }

  if (normalized.includes('tool is not available')) {
    return 'This tool is no longer available for borrowing.';
  }

  if (
    normalized.includes(
      'already has an active damage report',
    )
  ) {
    return 'This tool already has an active damage report and maintenance request.';
  }

  if (normalized.includes('tool not found')) {
    return 'The selected tool could not be found.';
  }

  if (normalized.includes('maintenance task not found')) {
    return 'This maintenance task is no longer available or has already been completed.';
  }

  if (normalized.includes('permission denied')) {
    return 'You do not have permission to perform this action.';
  }

  if (
    normalized.includes('failed to fetch') ||
    normalized.includes('network')
  ) {
    return 'Unable to connect to the server. Please check your connection and try again.';
  }

  return message;
}