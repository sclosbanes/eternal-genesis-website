export const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export function validateImageUpload(file, { required = true } = {}) {
  if (!file || typeof file !== 'object' || file.size <= 0) {
    return required ? 'Image is required.' : null
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image too large. Maximum 5 MB.'
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return 'Image type is not allowed.'
  }

  return null
}

export function safeUploadName(name) {
  return String(name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_')
}
