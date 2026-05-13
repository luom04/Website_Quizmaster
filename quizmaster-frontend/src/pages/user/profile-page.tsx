import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CalendarClock,
  Loader2,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { TextField } from "@/components/forms/text-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

function getInitials(name?: string | null, email?: string) {
  const value = name || email || "U";

  return value
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDateTime(value?: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ProfileLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Skeleton className="h-80 rounded-3xl" />
      <div className="space-y-6">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-48 rounded-3xl" />
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
      <EmptyState
        icon={<AlertCircle className="size-6" />}
        title="Không thể tải hồ sơ"
        description="Có lỗi xảy ra khi lấy thông tin tài khoản. Vui lòng thử lại sau."
        action={
          <Button onClick={() => currentUserQuery.refetch()}>Tải lại</Button>
        }
      />
    );
  }

  const initials = getInitials(user.name, user.email);
  const avatarSrc = avatarPreviewUrl || user.avatarUrl;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="pointer-events-none absolute -right-20 -top-24 size-56 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative">
          <p className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <UserRound className="size-3.5 text-primary" />
            Account profile
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Hồ sơ cá nhân
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Quản lý thông tin tài khoản, tên hiển thị và ảnh đại diện của bạn
            trong Quizmaster.
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="rounded-3xl border-border/70 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-24 items-center justify-center overflow-hidden rounded-3xl border bg-muted text-2xl font-semibold">
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

              <h2 className="mt-4 text-xl font-semibold tracking-tight">
                {user.name || "Chưa đặt tên"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge variant="secondary">
                  <ShieldCheck className="size-3.5" />
                  {user.role}
                </Badge>

                <Badge variant={user.isActive ? "secondary" : "outline"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="size-4 text-muted-foreground" />
                  Email
                </div>
                <p className="mt-2 break-all text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>

              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CalendarClock className="size-4 text-muted-foreground" />
                  Created at
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatDateTime(user.createdAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Cập nhật thông tin</CardTitle>
              <CardDescription>
                Thay đổi tên hiển thị của bạn. Email và role không thể chỉnh ở
                trang này.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  id="name"
                  label="Tên hiển thị"
                  placeholder="Nhập tên của bạn"
                  disabled={updateMeMutation.isPending}
                  error={errors.name?.message}
                  {...register("name")}
                />

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={!isDirty || updateMeMutation.isPending}
                  >
                    {updateMeMutation.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Ảnh đại diện</CardTitle>
              <CardDescription>
                Chọn ảnh JPG, PNG hoặc WEBP. Dung lượng tối đa 2MB.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex size-20 items-center justify-center overflow-hidden rounded-3xl border bg-muted text-xl font-semibold">
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

                <div className="flex-1">
                  <p className="text-sm font-medium">Upload avatar mới</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Ảnh sẽ được upload lên Cloudinary và lưu URL vào hồ sơ của
                    bạn.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border bg-muted/30 p-4">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadAvatarMutation.isPending}
                  className="block w-full cursor-pointer rounded-xl border bg-background text-sm file:mr-4 file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={handleAvatarChange}
                />

                {selectedAvatarFile ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Đã chọn:{" "}
                    <span className="font-medium text-foreground">
                      {selectedAvatarFile.name}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                {selectedAvatarFile ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadAvatarMutation.isPending}
                    onClick={() => setSelectedAvatarFile(null)}
                  >
                    Hủy chọn
                  </Button>
                ) : null}

                <Button
                  type="button"
                  disabled={
                    !selectedAvatarFile || uploadAvatarMutation.isPending
                  }
                  onClick={handleUploadAvatar}
                >
                  {uploadAvatarMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Đang upload...
                    </>
                  ) : (
                    "Upload avatar"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Thông tin hệ thống</CardTitle>
              <CardDescription>
                Một số thông tin kỹ thuật của tài khoản.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">User ID</p>
                  <p className="mt-2 break-all text-sm font-medium">
                    {user.id}
                  </p>
                </div>

                <div className="rounded-2xl border bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Updated at</p>
                  <p className="mt-2 text-sm font-medium">
                    {formatDateTime(user.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
