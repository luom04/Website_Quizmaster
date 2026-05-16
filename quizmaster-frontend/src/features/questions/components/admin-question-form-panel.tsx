import {
  CheckCircle2,
  FileQuestion,
  Layers3,
  ListChecks,
  Loader2,
  Plus,
  Radio,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

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
import type {
  CreateQuestionRequest,
  Question,
  QuestionOptionInput,
  QuestionType,
} from "@/types/question";

type AdminQuestionFormPanelProps = {
  question: Question | null;
  categories: Category[];
  isSubmitting?: boolean;
  onCancelEdit: () => void;
  onCreate: (payload: CreateQuestionRequest) => Promise<void>;
  onUpdate: (
    questionId: string,
    payload: CreateQuestionRequest,
  ) => Promise<void>;
};

type QuestionFormSectionProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

function QuestionFormSection({
  icon,
  title,
  description,
  children,
}: QuestionFormSectionProps) {
  return (
    <section className="rounded-3xl border bg-background p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
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

function createEmptyOptions(): QuestionOptionInput[] {
  return [
    {
      content: "",
      isCorrect: true,
      orderIndex: 1,
    },
    {
      content: "",
      isCorrect: false,
      orderIndex: 2,
    },
  ];
}

export function AdminQuestionFormPanel({
  question,
  categories,
  isSubmitting,
  onCancelEdit,
  onCreate,
  onUpdate,
}: AdminQuestionFormPanelProps) {
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<QuestionType>("single");
  const [options, setOptions] =
    useState<QuestionOptionInput[]>(createEmptyOptions);

  const isEditing = Boolean(question);

  const trimmedContent = content.trim();
  const correctCount = options.filter((option) => option.isCorrect).length;
  const completedOptionCount = options.filter(
    (option) => option.content.trim().length > 0,
  ).length;

  useEffect(() => {
    if (!question) {
      setContent("");
      setCategoryId("");
      setType("single");
      setOptions(createEmptyOptions());
      return;
    }

    setContent(question.content);
    setCategoryId(question.categoryId ?? "");
    setType(question.type);
    setOptions(
      question.options
        .slice()
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((option, index) => ({
          content: option.content,
          isCorrect: option.isCorrect,
          orderIndex: index + 1,
        })),
    );
  }, [question]);

  function updateOptionContent(index: number, value: string) {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? { ...option, content: value } : option,
      ),
    );
  }

  function toggleCorrect(index: number) {
    setOptions((current) => {
      if (type === "single") {
        return current.map((option, optionIndex) => ({
          ...option,
          isCorrect: optionIndex === index,
        }));
      }

      return current.map((option, optionIndex) =>
        optionIndex === index
          ? { ...option, isCorrect: !option.isCorrect }
          : option,
      );
    });
  }

  function handleTypeChange(nextType: QuestionType) {
    setType(nextType);

    if (nextType === "single") {
      setOptions((current) =>
        current.map((option, index) => ({
          ...option,
          isCorrect: index === 0,
        })),
      );
    }
  }

  function addOption() {
    setOptions((current) => [
      ...current,
      {
        content: "",
        isCorrect: false,
        orderIndex: current.length + 1,
      },
    ]);
  }

  function removeOption(index: number) {
    setOptions((current) => {
      if (current.length <= 2) {
        toast.error("Câu hỏi phải có ít nhất 2 đáp án.");
        return current;
      }

      const nextOptions = current.filter(
        (_, optionIndex) => optionIndex !== index,
      );

      if (!nextOptions.some((option) => option.isCorrect)) {
        nextOptions[0] = {
          ...nextOptions[0],
          isCorrect: true,
        };
      }

      return nextOptions.map((option, optionIndex) => ({
        ...option,
        orderIndex: optionIndex + 1,
      }));
    });
  }

  function validateForm() {
    if (trimmedContent.length < 2) {
      toast.error("Nội dung câu hỏi phải có ít nhất 2 ký tự.");
      return false;
    }

    const normalizedOptions = options.map((option, index) => ({
      ...option,
      content: option.content.trim(),
      orderIndex: index + 1,
    }));

    if (normalizedOptions.length < 2) {
      toast.error("Câu hỏi phải có ít nhất 2 đáp án.");
      return false;
    }

    if (normalizedOptions.some((option) => option.content.length === 0)) {
      toast.error("Nội dung đáp án không được để trống.");
      return false;
    }

    const normalizedCorrectCount = normalizedOptions.filter(
      (option) => option.isCorrect,
    ).length;

    if (type === "single" && normalizedCorrectCount !== 1) {
      toast.error("Single choice phải có đúng 1 đáp án đúng.");
      return false;
    }

    if (type === "multiple" && normalizedCorrectCount < 1) {
      toast.error("Multiple choice phải có ít nhất 1 đáp án đúng.");
      return false;
    }

    return true;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!validateForm()) return;

    const payload: CreateQuestionRequest = {
      content: trimmedContent,
      categoryId: categoryId || undefined,
      type,
      options: options.map((option, index) => ({
        content: option.content.trim(),
        isCorrect: option.isCorrect,
        orderIndex: index + 1,
      })),
    };

    if (question) {
      await onUpdate(question.id, payload);
      return;
    }

    await onCreate(payload);
    setContent("");
    setCategoryId("");
    setType("single");
    setOptions(createEmptyOptions());
  }

  return (
    <Card className="gap-0 overflow-hidden rounded-3xl py-0 shadow-sm">
      <CardHeader className="relative overflow-hidden rounded-t-3xl border-b border-emerald-200/60 px-4 py-5 sm:px-6 sm:py-6 [.border-b]:pb-5 sm:[.border-b]:pb-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-50" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_120%_at_100%_-30%,rgba(16,185,129,0.28),transparent_55%)]" />
        <div className="pointer-events-none absolute -left-12 -top-12 size-44 rounded-full bg-emerald-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-6 top-0 size-40 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>
              {isEditing ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
            </CardTitle>
            <CardDescription className="mt-2">
              Cấu hình nội dung câu hỏi, loại câu hỏi và danh sách đáp án cho
              ngân hàng câu hỏi.
            </CardDescription>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-700">
                {isEditing ? "Edit mode" : "Create mode"}
              </span>

              <span className="inline-flex rounded-full bg-background/80 px-2.5 py-1 font-medium text-muted-foreground">
                {type === "multiple" ? "Multiple choice" : "Single choice"}
              </span>

              <span className="inline-flex rounded-full bg-background/80 px-2.5 py-1 font-medium text-muted-foreground">
                {options.length} options
              </span>

              <span className="inline-flex rounded-full bg-background/80 px-2.5 py-1 font-medium text-muted-foreground">
                {correctCount} correct
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
          <QuestionFormSection
            icon={<FileQuestion className="size-5" />}
            title="Nội dung câu hỏi"
            description="Viết câu hỏi rõ ràng, đủ ngữ cảnh và dễ hiểu để user có thể trả lời chính xác."
          >
            <label className="text-sm font-medium">Nội dung câu hỏi</label>

            <textarea
              value={content}
              disabled={isSubmitting}
              rows={4}
              className="mt-2 min-h-28 w-full rounded-2xl border border-input bg-background px-3 py-3 text-sm outline-none qm-hover-surface placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Nhập nội dung câu hỏi..."
              onChange={(event) => setContent(event.target.value)}
            />

            {trimmedContent.length > 0 && trimmedContent.length < 2 ? (
              <p className="mt-2 text-xs text-destructive">
                Nội dung câu hỏi cần ít nhất 2 ký tự.
              </p>
            ) : null}
          </QuestionFormSection>

          <QuestionFormSection
            icon={<Layers3 className="size-5" />}
            title="Phân loại câu hỏi"
            description="Chọn category và loại câu hỏi. Category giúp admin lọc câu hỏi và chỉ thêm đúng nhóm câu hỏi vào quiz."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Category</label>

                <select
                  value={categoryId}
                  disabled={isSubmitting}
                  className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none qm-hover-surface focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(event) => setCategoryId(event.target.value)}
                >
                  <option value="">General</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {!categoryId ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Câu hỏi General sẽ không tự động thuộc category cụ thể nào.
                  </p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium">Type</label>

                <select
                  value={type}
                  disabled={isSubmitting}
                  className="mt-2 h-10 w-full cursor-pointer rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none qm-hover-surface focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(event) =>
                    handleTypeChange(event.target.value as QuestionType)
                  }
                >
                  <option value="single">Single choice</option>
                  <option value="multiple">Multiple choice</option>
                </select>

                <p className="mt-2 text-xs text-muted-foreground">
                  {type === "single"
                    ? "Single choice yêu cầu đúng 1 đáp án đúng."
                    : "Multiple choice có thể có nhiều đáp án đúng."}
                </p>
              </div>
            </div>
          </QuestionFormSection>

          <QuestionFormSection
            icon={
              type === "single" ? (
                <Radio className="size-5" />
              ) : (
                <ListChecks className="size-5" />
              )
            }
            title="Danh sách đáp án"
            description="Thêm tối thiểu 2 đáp án và đánh dấu đáp án đúng. Với single choice, chỉ một đáp án được chọn là đúng."
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex rounded-full bg-muted px-2.5 py-1 font-medium text-muted-foreground">
                  {completedOptionCount}/{options.length} completed
                </span>

                <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-700">
                  {correctCount} correct
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={isSubmitting}
                onClick={addOption}
              >
                <Plus className="mr-2 size-4" />
                Thêm đáp án
              </Button>
            </div>

            <div className="space-y-3">
              {options.map((option, index) => {
                const inputType = type === "single" ? "radio" : "checkbox";

                return (
                  <div
                    key={index}
                    className="rounded-2xl border bg-muted/20 p-4 qm-row-hover"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
                      <label className="flex cursor-pointer items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm qm-hover-surface lg:w-40">
                        <input
                          type={inputType}
                          name="correct-answer"
                          checked={option.isCorrect}
                          disabled={isSubmitting}
                          className="size-4 cursor-pointer disabled:cursor-not-allowed"
                          onChange={() => toggleCorrect(index)}
                        />
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        <span>Correct</span>
                      </label>

                      <div className="min-w-0 flex-1">
                        <Input
                          value={option.content}
                          disabled={isSubmitting}
                          className="h-10 rounded-xl"
                          placeholder={`Đáp án ${index + 1}`}
                          onChange={(event) =>
                            updateOptionContent(index, event.target.value)
                          }
                        />

                        <p className="mt-2 text-xs text-muted-foreground">
                          Order index: {index + 1}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="cursor-pointer text-destructive hover:text-destructive disabled:cursor-not-allowed"
                        disabled={isSubmitting || options.length <= 2}
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Xóa
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </QuestionFormSection>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="cursor-pointer disabled:cursor-not-allowed"
              disabled={isSubmitting}
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
                  Tạo câu hỏi
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
