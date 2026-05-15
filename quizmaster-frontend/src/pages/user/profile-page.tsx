import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  FileImage,
  IdCard,
  ImagePlus,
  Loader2,
  Mail,
  RotateCcw,
  Save,
  ShieldCheck,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { TextField } from "@/components/forms/text-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useCurrentUser,
  useUpdateMe,
  useUploadAvatar,
} from "@/features/users/users.hooks";
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from "@/features/users/user.schema";

import { getApiErrorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";

function getInitials(name?: string | null, email?: string) {
  const value = name || email || "U";

  return value
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ProfileLoading() {
  return (
    <div className="-mx-4 -my-8 min-h-[calc(100vh-4rem)] qm-exam-focus-bg px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="qm-page-shell-wide space-y-6">
        <section className="qm-soft-card overflow-hidden">
          <div className="border-b bg-muted/25 p-6 sm:p-8">
            <Skeleton className="h-7 w-36 rounded-full" />
            <Skeleton className="mt-5 h-10 w-72 max-w-full" />
            <Skeleton className="mt-3 h-5 w-[520px] max-w-full" />
          </div>

          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <Skeleton className="h-80 rounded-3xl" />
            <Skeleton className="h-80 rounded-3xl" />
          </div>
        </section>
      </div>
    </div>
  );
}

const AVATAR_MAX_SIZE = 2 * 1024 * 1024;
const AVATAR_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ProfilePage() {
  const currentUserQuery = useCurrentUser();
  const updateMeMutation = useUpdateMe();
  const uploadAvatarMutation = useUploadAvatar();

  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null,
  );
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  const user = currentUserQuery.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (!user) return;

    reset({
      name: user.name || "",
    });
  }, [reset, user]);

  useEffect(() => {
    if (!selectedAvatarFile) {
      setAvatarPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedAvatarFile);
    setAvatarPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedAvatarFile]);

  async function onSubmit(values: UpdateProfileFormValues) {
    try {
      const updatedUser = await updateMeMutation.mutateAsync({
        name: values.name.trim(),
      });

      reset({
        name: updatedUser.name || "",
      });

      toast.success("Cập nhật hồ sơ thành công");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Không thể cập nhật hồ sơ. Vui lòng thử lại.",
        ),
      );
    }
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
      toast.error("Avatar phải là ảnh JPG, PNG hoặc WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > AVATAR_MAX_SIZE) {
      toast.error("Avatar không được vượt quá 2MB.");
      event.target.value = "";
      return;
    }

    setSelectedAvatarFile(file);
  }

  async function handleUploadAvatar() {
    if (!selectedAvatarFile) {
      toast.error("Vui lòng chọn ảnh đại diện.");
      return;
    }

    try {
      await uploadAvatarMutation.mutateAsync(selectedAvatarFile);
      setSelectedAvatarFile(null);
      toast.success("Cập nhật ảnh đại diện thành công");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Không thể upload ảnh đại diện. Vui lòng thử lại.",
        ),
      );
    }
  }

  if (currentUserQuery.isLoading) {
    return <ProfileLoading />;
  }

  if (currentUserQuery.isError || !user) {
    return (
      <div className="-mx-4 -my-8 min-h-[calc(100vh-4rem)] qm-exam-focus-bg px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="qm-page-shell">
          <EmptyState
            icon={<AlertCircle className="size-6" />}
            title="Không thể tải hồ sơ"
            description="Có lỗi xảy ra khi lấy thông tin tài khoản. Vui lòng thử lại sau."
            action={
              <Button
                type="button"
                className="rounded-2xl"
                onClick={() => currentUserQuery.refetch()}
              >
                <RotateCcw className="size-4" />
                Tải lại
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const initials = getInitials(user.name, user.email);
  const avatarSrc = avatarPreviewUrl || user.avatarUrl;
  const isAvatarUploading = uploadAvatarMutation.isPending;
  const isProfileSaving = updateMeMutation.isPending;

  return (
    <div className="-mx-4 -my-8 min-h-[calc(100vh-4rem)] qm-exam-focus-bg px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="qm-page-shell-wide space-y-6 animate-in fade-in duration-500">
        <section className="qm-soft-card overflow-hidden">
          <div className="border-b bg-muted/25 p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="qm-section-eyebrow">
                  <UserRound className="size-3.5" />
                  Account settings
                </p>

                <h1 className="qm-section-title mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Hồ sơ cá nhân
                </h1>

                <p className="qm-section-description mt-3 max-w-2xl leading-7">
                  Quản lý tên hiển thị, ảnh đại diện và các thông tin tài khoản
                  của bạn trong Quizmaster.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="rounded-full border-indigo-200 bg-indigo-50 px-3 py-1 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300"
                >
                  <ShieldCheck className="size-3.5" />
                  {user.role.toUpperCase()}
                </Badge>

                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full px-3 py-1",
                    user.isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                      : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300",
                  )}
                >
                  <CheckCircle2 className="size-3.5" />
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="space-y-5">
              <section className="qm-soft-card border bg-card p-5">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="flex size-28 items-center justify-center overflow-hidden rounded-[2rem] border bg-muted text-3xl font-bold text-muted-foreground shadow-sm">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={user.name || user.email}
                          className="size-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>

                    <div className="absolute -bottom-2 -right-2 flex size-10 items-center justify-center rounded-2xl border bg-background shadow-sm">
                      <ImagePlus className="size-5 text-primary" />
                    </div>
                  </div>

                  <h2 className="qm-text-balance mt-5 text-xl font-semibold tracking-tight">
                    {user.name || "Chưa đặt tên"}
                  </h2>

                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="size-4" />
                    <span className="truncate">{user.email}</span>
                  </p>
                </div>

                <div className="mt-6 space-y-3 border-t pt-5">
                  <div className="flex items-start gap-3 rounded-2xl border bg-muted/25 p-3">
                    <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="truncate text-sm font-medium">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl border bg-muted/25 p-3">
                    <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Created at
                      </p>
                      <p className="truncate text-sm font-medium">
                        {formatDateTime(user.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="qm-soft-card border bg-card p-5">
                <h3 className="flex items-center gap-2 text-base font-semibold">
                  <IdCard className="size-4 text-primary" />
                  Thông tin hệ thống
                </h3>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-2xl border bg-muted/25 p-3">
                    <p className="text-xs text-muted-foreground">User ID</p>
                    <p className="mt-1 break-all font-mono text-xs font-medium">
                      {user.id}
                    </p>
                  </div>

                  <div className="rounded-2xl border bg-muted/25 p-3">
                    <p className="text-xs text-muted-foreground">Updated at</p>
                    <p className="mt-1 text-sm font-medium">
                      {formatDateTime(user.updatedAt)}
                    </p>
                  </div>
                </div>
              </section>
            </aside>

            <div className="space-y-5">
              <section className="qm-soft-card border bg-card p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      Cập nhật thông tin
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Thay đổi tên hiển thị của bạn. Email và role không thể
                      chỉnh ở trang này.
                    </p>
                  </div>

                  {isDirty ? (
                    <Badge
                      variant="outline"
                      className="w-fit rounded-full border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
                    >
                      Có thay đổi
                    </Badge>
                  ) : null}
                </div>

                <form
                  className="mt-6 space-y-5"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <TextField
                    id="name"
                    label="Tên hiển thị"
                    placeholder="Nhập tên của bạn"
                    disabled={isProfileSaving}
                    error={errors.name?.message}
                    {...register("name")}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    className="h-11 rounded-2xl font-semibold shadow-sm transition-all hover:-translate-y-0.5"
                    disabled={!isDirty || isProfileSaving}
                  >
                    {isProfileSaving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="size-4" />
                        Lưu thay đổi
                      </>
                    )}
                  </Button>
                </form>
              </section>

              <section className="qm-soft-card border bg-card p-5 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      Ảnh đại diện
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Chọn ảnh JPG, PNG hoặc WEBP. Dung lượng tối đa 2MB.
                    </p>
                  </div>

                  <Badge variant="secondary" className="w-fit rounded-full">
                    Max 2MB
                  </Badge>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-[160px_minmax(0,1fr)]">
                  <div className="flex justify-center lg:justify-start">
                    <div className="flex size-36 items-center justify-center overflow-hidden rounded-[2rem] border bg-muted text-3xl font-bold text-muted-foreground shadow-sm">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt={user.name || user.email}
                          className="size-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-dashed bg-muted/20 p-5">
                      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <FileImage className="size-5" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold">
                              Upload avatar mới
                            </p>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              Ảnh sẽ được upload và lưu URL vào hồ sơ của bạn.
                            </p>
                          </div>
                        </div>

                        <label
                          htmlFor="avatar"
                          className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-2xl border bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          <ImagePlus className="size-4" />
                          Chọn ảnh
                        </label>

                        <input
                          id="avatar"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          disabled={isAvatarUploading}
                          onChange={handleAvatarChange}
                        />
                      </div>
                    </div>

                    {selectedAvatarFile ? (
                      <div className="rounded-2xl border bg-muted/25 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">
                              Đã chọn
                            </p>
                            <p className="mt-1 truncate text-sm font-medium">
                              {selectedAvatarFile.name}
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-fit rounded-2xl"
                            disabled={isAvatarUploading}
                            onClick={() => setSelectedAvatarFile(null)}
                          >
                            <X className="size-4" />
                            Hủy chọn
                          </Button>
                        </div>
                      </div>
                    ) : null}

                    <Button
                      type="button"
                      size="lg"
                      className="h-11 rounded-2xl font-semibold shadow-sm transition-all hover:-translate-y-0.5"
                      disabled={!selectedAvatarFile || isAvatarUploading}
                      onClick={handleUploadAvatar}
                    >
                      {isAvatarUploading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Đang upload...
                        </>
                      ) : (
                        <>
                          <Upload className="size-4" />
                          Upload avatar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
