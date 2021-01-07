class ApiResponseMocker {
  mockSuccess (result) {
    return {
      status: 200,
      data: {
        data: result
      }
    }
  }

  mockInvalid (errors) {
    return {
      status: 422,
      data: {
        message: 'The given data was invalid.',
        errors
      }
    }
  }
}

export default new ApiResponseMocker()
