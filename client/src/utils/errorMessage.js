const errorMessage = (err) => {
  // Zod validation errors — array of field errors
  if (err.response?.data?.errors?.length) {
    return err.response.data.errors.map((e) => e.message).join(', ')
  }
  // Single message from ApiError
  if (err.response?.data?.message) {
    return err.response.data.message
  }
  // Network error
  return 'Something went wrong. Please try again.'
}

export default errorMessage