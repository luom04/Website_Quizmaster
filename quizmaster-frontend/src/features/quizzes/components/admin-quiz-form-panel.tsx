import { Loader2, Plus, Save, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedPassword = password.trim();

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
    <Card className="rounded-3xl border-border/70 shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>{isEditing ? "Chỉnh sửa quiz" : "Tạo quiz mới"}</CardTitle>
          <CardDescription>
            Cấu hình thông tin quiz, thời lượng, quyền truy cập và trạng thái
            phát hành.
          </CardDescription>
        </div>

        {isEditing ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancelEdit}
          >
            <X className="size-4" />
            Hủy sửa
          </Button>
        ) : null}
      </CardHeader>

      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 xl:grid-cols-[1fr_260px_220px]">
            <div>
              <label className="text-sm font-medium">Tiêu đề quiz</label>
              <Input
                value={title}
                disabled={isSubmitting}
                className="mt-2 h-10 rounded-xl"
                placeholder="Nhập tiêu đề quiz"
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={categoryId}
                disabled={isSubmitting}
                className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
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

            <div>
              <label className="text-sm font-medium">Access mode</label>
              <select
                value={accessMode}
                disabled={isSubmitting}
                className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                onChange={(event) =>
                  setAccessMode(event.target.value as QuizAccessMode)
                }
              >
                <option value="public">Public</option>
                <option value="password_required">Password required</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Mô tả</label>
            <textarea
              value={description}
              disabled={isSubmitting}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Mô tả ngắn về quiz"
              onChange={(event) => setDescription(event.target.value)}
            />
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
            </div>
          ) : null}

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
                onChange={(event) => setMaxAttempts(Number(event.target.value))}
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
                className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                onChange={(event) =>
                  setIsPublished(event.target.value === "true")
                }
              >
                <option value="false">Draft</option>
                <option value="true">Published</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Starts at</label>
              <Input
                type="datetime-local"
                value={startsAt}
                disabled={isSubmitting}
                className="mt-2 h-10 rounded-xl"
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Ends at</label>
              <Input
                type="datetime-local"
                value={endsAt}
                disabled={isSubmitting}
                className="mt-2 h-10 rounded-xl"
                onChange={(event) => setEndsAt(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex items-center gap-2 rounded-2xl border bg-muted/30 p-4 text-sm">
              <input
                type="checkbox"
                checked={showAnswer}
                disabled={isSubmitting}
                className="size-4"
                onChange={(event) => setShowAnswer(event.target.checked)}
              />
              Show answers
            </label>

            <label className="flex items-center gap-2 rounded-2xl border bg-muted/30 p-4 text-sm">
              <input
                type="checkbox"
                checked={shuffleQuestions}
                disabled={isSubmitting}
                className="size-4"
                onChange={(event) => setShuffleQuestions(event.target.checked)}
              />
              Shuffle questions
            </label>

            <label className="flex items-center gap-2 rounded-2xl border bg-muted/30 p-4 text-sm">
              <input
                type="checkbox"
                checked={shuffleOptions}
                disabled={isSubmitting}
                className="size-4"
                onChange={(event) => setShuffleOptions(event.target.checked)}
              />
              Shuffle options
            </label>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                title.trim().length < 3 ||
                (!isEditing &&
                  accessMode === "password_required" &&
                  password.trim().length === 0)
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang lưu...
                </>
              ) : isEditing ? (
                <>
                  <Save className="size-4" />
                  Lưu thay đổi
                </>
              ) : (
                <>
                  <Plus className="size-4" />
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
