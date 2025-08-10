package examhandler

import (
    "context"
)

// Lambda용 핸들러
func ExamHandlerLambda(ctx context.Context) (string, error) {
    return "Lambda handler executed successfully", nil
}
