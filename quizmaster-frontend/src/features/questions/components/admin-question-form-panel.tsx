import { Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
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
    if (content.trim().length < 2) {
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

    const correctCount = normalizedOptions.filter(
      (option) => option.isCorrect,
    ).length;

    if (type === "single" && correctCount !== 1) {
      toast.error("Single choice phải có đúng 1 đáp án đúng.");
      return false;
    }

    if (type === "multiple" && correctCount < 1) {
      toast.error("Multiple choice phải có ít nhất 1 đáp án đúng.");
      return false;
    }

    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) return;

    const payload: CreateQuestionRequest = {
      content: content.trim(),
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
    <Card className="rounded-3xl border-border/70 shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>
            {isEditing ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
          </CardTitle>
          <CardDescription>
            Cấu hình nội dung câu hỏi, loại câu hỏi và danh sách đáp án.
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
          <div className="grid gap-4 lg:grid-cols-[1fr_260px_200px]">
            <div>
              <label className="text-sm font-medium">Nội dung câu hỏi</label>
              <Input
                value={content}
                disabled={isSubmitting}
                className="mt-2 h-10 rounded-xl"
                placeholder="Nhập nội dung câu hỏi"
                onChange={(event) => setContent(event.target.value)}
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
              <label className="text-sm font-medium">Type</label>
              <select
                value={type}
                disabled={isSubmitting}
                className="mt-2 h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                onChange={(event) =>
                  handleTypeChange(event.target.value as QuestionType)
                }
              >
                <option value="single">Single choice</option>
                <option value="multiple">Multiple choice</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/30 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Đáp án</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {type === "single"
                    ? "Single choice yêu cầu đúng 1 đáp án đúng."
                    : "Multiple choice có thể có nhiều đáp án đúng."}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
              >
                <Plus className="size-4" />
                Thêm đáp án
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-2xl border bg-background p-3 lg:grid-cols-[auto_1fr_auto]"
                >
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type={type === "single" ? "radio" : "checkbox"}
                      checked={option.isCorrect}
                      disabled={isSubmitting}
                      name="correct-option"
                      className="size-4"
                      onChange={() => toggleCorrect(index)}
                    />
                    Correct
                  </label>

                  <Input
                    value={option.content}
                    disabled={isSubmitting}
                    className="h-10 rounded-xl"
                    placeholder={`Đáp án ${index + 1}`}
                    onChange={(event) =>
                      updateOptionContent(index, event.target.value)
                    }
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isSubmitting || options.length <= 2}
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="size-4" />
                    Xóa
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
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
