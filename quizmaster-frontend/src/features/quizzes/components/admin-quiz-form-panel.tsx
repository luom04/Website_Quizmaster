import {
  CalendarClock,
  Eye,
  FileText,
  KeyRound,
  Loader2,
  Plus,
  Save,
  Settings2,
  Shuffle,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Category } from "@/types/category";
import type { CreateQuizRequest, Quiz, QuizAccessMode } from "@/types/quiz";

type AdminQuizFormPanelProps = {
  quiz: Quiz | null;
  categories: Category[];
  isSubmitting?: boolean;
  onCancelEdit: () => void;
  onCreate: (payload: CreateQuizRequest) => Promise<void>;
  onUpdate: (quizId: string, payload: CreateQuizRequest) => Promise<void>;
};

type FormSectionProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

function FormSection({ icon, title, description, children }: FormSectionProps) {
  return (
    <section className="rounded-3xl border bg-background p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
          {icon}
        </span>

        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  const localDate = new Date(date.getTime() - timezoneOffset);

  return localDate.toISOString().slice(0, 16);
}

function toIsoStringOrUndefined(value: string) {
  if (!value) return undefined;

  return new Date(value).toISOString();
}

export function AdminQuizFormPanel({
  quiz,
  categories,
  isSubmitting,
  onCancelEdit,
  onCreate,
  onUpdate,
}: AdminQuizFormPanelProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accessMode, setAccessMode] = useState<QuizAccessMode>("public");
  const [password, setPassword] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [passingScore, setPassingScore] = useState(5);
  const [showAnswer, setShowAnswer] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const isEditing = Boolean(quiz);
  const trimmedTitle = title.trim();
  const trimmedPassword = password.trim();

  const submitDisabled =
    isSubmitting ||
    trimmedTitle.length < 3 ||
    (!isEditing &&
      accessMode === "password_required" &&
      trimmedPassword.length === 0);

  useEffect(() => {
    if (!quiz) {
      setTitle("");
      setDescription("");
      setCategoryId("");
      setAccessMode("public");
      setPassword("");
      setDurationMinutes(30);
      setStartsAt("");
      setEndsAt("");
      setMaxAttempts(1);
      setPassingScore(5);
      setShowAnswer(true);
      setShuffleQuestions(false);
      setShuffleOptions(false);
      setIsPublished(false);
      return;
    }

    setTitle(quiz.title);
    setDescription(quiz.description || "");
    setCategoryId(quiz.categoryId || "");
    setAccessMode(quiz.accessMode);
    setPassword("");
    setDurationMinutes(quiz.durationMinutes);
    setStartsAt(toDateTimeLocal(quiz.startsAt));
    setEndsAt(toDateTimeLocal(quiz.endsAt));
    setMaxAttempts(quiz.maxAttempts);
    setPassingScore(quiz.passingScore ?? 5);
    setShowAnswer(quiz.showAnswer);
    setShuffleQuestions(quiz.shuffleQuestions);
    setShuffleOptions(quiz.shuffleOptions);
    setIsPublished(quiz.isPublished);
  }, [quiz]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (trimmedTitle.length < 3) return;

    const payload: CreateQuizRequest = {
      title: trimmedTitle,
      description: description.trim() || undefined,
      categoryId: categoryId || undefined,
      accessMode,
      durationMinutes,
      startsAt: toIsoStringOrUndefined(startsAt),
      endsAt: toIsoStringOrUndefined(endsAt),
      maxAttempts,
      passingScore,
      showAnswer,
      shuffleQuestions,
      shuffleOptions,
      isPublished,
    };

    if (accessMode === "password_required" && trimmedPassword) {
      payload.password = trimmedPassword;
    }

    if (!isEditing && accessMode === "password_required" && !trimmedPassword) {
      return;
    }

    if (quiz) {
      await onUpdate(quiz.id, payload);
      return;
    }

    await onCreate(payload);
  }

  return (
    <Card className="overflow-hidden rounded-3xl shadow-sm">
      <CardHeader className="relative overflow-hidden border-b bg-violet-50/80">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/20 via-blue-500/10 to-sky-500/20" />
        <div className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>
              {isEditing ? "Chỉnh sửa quiz" : "Tạo quiz mới"}
            </CardTitle>
            <CardDescription className="mt-2">
              Cấu hình thông tin, quyền truy cập, thời lượng và trạng thái phát
              hành cho quiz.
            </CardDescription>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex rounded-full bg-violet-500/10 px-2.5 py-1 font-medium text-violet-600">
                {isEditing ? "Edit mode" : "Create mode"}
              </span>

              <span className="inline-flex rounded-full bg-background/80 px-2.5 py-1 font-medium text-muted-foreground">
                {isPublished ? "Published" : "Draft"}
              </span>

              <span className="inline-flex rounded-full bg-background/80 px-2.5 py-1 font-medium text-muted-foreground">
                {accessMode === "password_required"
                  ? "Password required"
                  : "Public"}
              </span>
            </div>
          </div>

          {isEditing ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              disabled={isSubmitting}
              onClick={onCancelEdit}
            >
              <X className="mr-2 size-4" />
              Hủy sửa
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormSection
            icon={<FileText className="size-5" />}
            title="Thông tin cơ bản"
            description="Đặt tên, mô tả và category cho quiz. Category sẽ quyết định nhóm câu hỏi có thể thêm vào quiz."
          >
            <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
              <div>
                <label className="text-sm font-medium">Tiêu đề quiz</label>
                <Input
                  value={title}
                  disabled={isSubmitting}
                  className="mt-2 h-10 rounded-xl"
                  placeholder="Ví dụ: SQL Fundamentals Quiz"
                  onChange={(event) => setTitle(event.target.value)}
                />
                {trimmedTitle.length > 0 && trimmedTitle.length < 3 ? (
                  <p className="mt-2 text-xs text-destructive">
                    Tiêu đề cần ít nhất 3 ký tự.
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={categoryId}
                  disabled={isSubmitting}
                  className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(event) => setCategoryId(event.target.value)}
                >
                  <option value="">General</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium">Mô tả</label>
              <textarea
                value={description}
                disabled={isSubmitting}
                rows={3}
                className="mt-2 min-h-24 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground hover:bg-muted/30 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Mô tả ngắn về nội dung, đối tượng và mục tiêu của quiz..."
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </FormSection>

          <FormSection
            icon={<KeyRound className="size-5" />}
            title="Quyền truy cập"
            description="Chọn quiz public hoặc yêu cầu password. Khi chỉnh sửa, để trống password nếu không muốn đổi."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Access mode</label>
                <select
                  value={accessMode}
                  disabled={isSubmitting}
                  className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(event) =>
                    setAccessMode(event.target.value as QuizAccessMode)
                  }
                >
                  <option value="public">Public</option>
                  <option value="password_required">Password required</option>
                </select>
              </div>

              {accessMode === "password_required" ? (
                <div>
                  <label className="text-sm font-medium">
                    Password {isEditing ? "(để trống nếu không đổi)" : ""}
                  </label>
                  <Input
                    value={password}
                    disabled={isSubmitting}
                    className="mt-2 h-10 rounded-xl"
                    placeholder={
                      isEditing
                        ? "Nhập password mới nếu muốn đổi"
                        : "Nhập password cho quiz"
                    }
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  {!isEditing && trimmedPassword.length === 0 ? (
                    <p className="mt-2 text-xs text-destructive">
                      Quiz password required cần có password.
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                  User có thể truy cập quiz này mà không cần nhập password.
                </div>
              )}
            </div>
          </FormSection>

          <FormSection
            icon={<Settings2 className="size-5" />}
            title="Quy tắc làm bài"
            description="Cấu hình thời lượng, số lần làm bài, điểm đạt và trạng thái phát hành."
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="text-sm font-medium">Duration minutes</label>
                <Input
                  type="number"
                  min={1}
                  value={durationMinutes}
                  disabled={isSubmitting}
                  className="mt-2 h-10 rounded-xl"
                  onChange={(event) =>
                    setDurationMinutes(Number(event.target.value))
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Max attempts</label>
                <Input
                  type="number"
                  min={1}
                  value={maxAttempts}
                  disabled={isSubmitting}
                  className="mt-2 h-10 rounded-xl"
                  onChange={(event) =>
                    setMaxAttempts(Number(event.target.value))
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Passing score</label>
                <Input
                  type="number"
                  min={0}
                  value={passingScore}
                  disabled={isSubmitting}
                  className="mt-2 h-10 rounded-xl"
                  onChange={(event) =>
                    setPassingScore(Number(event.target.value))
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Published</label>
                <select
                  value={isPublished ? "true" : "false"}
                  disabled={isSubmitting}
                  className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(event) =>
                    setIsPublished(event.target.value === "true")
                  }
                >
                  <option value="false">Draft</option>
                  <option value="true">Published</option>
                </select>
              </div>
            </div>
          </FormSection>

          <FormSection
            icon={<CalendarClock className="size-5" />}
            title="Lịch mở quiz"
            description="Thiết lập thời gian bắt đầu và kết thúc. Có thể để trống nếu quiz không giới hạn lịch."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Starts at</label>
                <Input
                  type="datetime-local"
                  value={startsAt}
                  disabled={isSubmitting}
                  className="mt-2 h-10 rounded-xl cursor-pointer"
                  onChange={(event) => setStartsAt(event.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Ends at</label>
                <Input
                  type="datetime-local"
                  value={endsAt}
                  disabled={isSubmitting}
                  className="mt-2 h-10 rounded-xl cursor-pointer"
                  onChange={(event) => setEndsAt(event.target.value)}
                />
              </div>
            </div>
          </FormSection>

          <FormSection
            icon={<Shuffle className="size-5" />}
            title="Hành vi khi làm bài"
            description="Điều chỉnh cách hiển thị đáp án và thứ tự câu hỏi/câu trả lời cho user."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border bg-muted/30 p-4 text-sm transition hover:bg-muted/50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                <input
                  type="checkbox"
                  checked={showAnswer}
                  disabled={isSubmitting}
                  className="size-4 cursor-pointer disabled:cursor-not-allowed"
                  onChange={(event) => setShowAnswer(event.target.checked)}
                />
                <span className="flex items-center gap-2">
                  <Eye className="size-4 text-muted-foreground" />
                  Show answers
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border bg-muted/30 p-4 text-sm transition hover:bg-muted/50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  disabled={isSubmitting}
                  className="size-4 cursor-pointer disabled:cursor-not-allowed"
                  onChange={(event) =>
                    setShuffleQuestions(event.target.checked)
                  }
                />
                <span>Shuffle questions</span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border bg-muted/30 p-4 text-sm transition hover:bg-muted/50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  disabled={isSubmitting}
                  className="size-4 cursor-pointer disabled:cursor-not-allowed"
                  onChange={(event) => setShuffleOptions(event.target.checked)}
                />
                <span>Shuffle options</span>
              </label>
            </div>
          </FormSection>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="cursor-pointer disabled:cursor-not-allowed"
              disabled={submitDisabled}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Đang lưu...
                </>
              ) : isEditing ? (
                <>
                  <Save className="mr-2 size-4" />
                  Lưu thay đổi
                </>
              ) : (
                <>
                  <Plus className="mr-2 size-4" />
                  Tạo quiz
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
