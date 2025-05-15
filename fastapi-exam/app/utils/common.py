def send_error(response, message, status_code):
    response.status_code = status_code
    response.body = {"detail": message}