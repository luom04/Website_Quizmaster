import type { ApiErrorResponse } from "@/types/api";

const API_ERROR_TRANSLATIONS: Record<string, string> = {
  "Access Denied": "Email hoặc mật khẩu không đúng.",
  "Email already exists": "Email này đã được sử dụng.",
  "Invalid recovery credentials":
    "Email hoặc mã khôi phục không đúng. Vui lòng kiểm tra lại.",
  "Refresh token expired":
    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  "Refresh token missing":
    "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
  "The exam room password is incorrect.": "Mật khẩu quiz không đúng.",
  "Quiz password is not configured":
    "Quiz chưa được cấu hình mật khẩu. Vui lòng liên hệ người tạo quiz.",
  "You do not have permission to edit this Quiz.":
    "Bạn không có quyền chỉnh sửa quiz này.",
  "It cannot be permanently erased.":
    "Không thể xóa vĩnh viễn quiz này.",
  "Quiz not found": "Không tìm thấy quiz.",
  "Question not found": "Không tìm thấy câu hỏi.",
  "Question not found.": "Không tìm thấy câu hỏi.",
  "User not found": "Không tìm thấy người dùng.",
  "User not found.": "Không tìm thấy người dùng.",
  "category not found": "Không tìm thấy category.",
  "Category not found": "Không tìm thấy category.",
  "Attempt not found": "Không tìm thấy lượt làm bài.",
  "Attempt not found.": "Không tìm thấy lượt làm bài.",
  "This question is not in the quiz.":
    "Câu hỏi này chưa có trong quiz.",
  "category name already exists": "Tên category đã tồn tại.",
  "Cannot be deleted":
    "Không thể xóa category này vì đang được sử dụng.",
  "Question is not deleted.":
    "Câu hỏi này chưa bị xóa, không thể khôi phục.",
  "Avatar file is required.": "Vui lòng chọn ảnh đại diện.",
  "Avatar must be a JPEG, PNG, or WEBP image.":
    "Ảnh đại diện phải là JPG, PNG hoặc WEBP.",
  "Avatar size must not exceed 2MB.":
    "Ảnh đại diện không được vượt quá 2MB.",
  "Image file is required.": "Vui lòng chọn file ảnh.",
  "Could not upload image to Cloudinary.":
    "Không thể tải ảnh lên. Vui lòng thử lại.",
};

const API_ERROR_PATTERNS: Array<{
  pattern: RegExp;
  translate: (match: RegExpMatchArray) => string;
}> = [
  {
    pattern: /^Question not found: .+$/,
    translate: () => "Không tìm thấy câu hỏi.",
  },
];

const VIETNAMESE_CHAR_PATTERN =
  /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

function extractNestedMessage(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => extractNestedMessage(item))
      .filter((item): item is string => Boolean(item));

    return parts.length > 0 ? parts.join(" ") : undefined;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    if ("message" in record) {
      return extractNestedMessage(record.message);
    }
  }

  return undefined;
}

export function extractApiResponseMessage(
  message: ApiErrorResponse["message"] | undefined,
): string | undefined {
  return extractNestedMessage(message);
}

export function localizeApiErrorMessage(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) return trimmed;

  const exactTranslation = API_ERROR_TRANSLATIONS[trimmed];
  if (exactTranslation) return exactTranslation;

  for (const { pattern, translate } of API_ERROR_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) return translate(match);
  }

  if (VIETNAMESE_CHAR_PATTERN.test(trimmed)) {
    return trimmed;
  }

  return trimmed;
}

export function getStatusFallbackMessage(
  status: number | undefined,
  fallback: string,
): string {
  switch (status) {
    case 400:
      return fallback || "Vui lòng kiểm tra lại thông tin đã nhập.";
    case 401:
      return fallback;
    case 403:
      return fallback;
    case 404:
      return fallback || "Không tìm thấy dữ liệu yêu cầu.";
    case 409:
      return fallback || "Dữ liệu đã tồn tại. Vui lòng kiểm tra lại.";
    case 422:
      return fallback || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
    case 429:
      return "Bạn thao tác quá nhanh. Vui lòng thử lại sau.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.";
    default:
      return fallback;
  }
}
