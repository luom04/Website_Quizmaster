import { Search, X, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface QuizListFiltersProps {
  search: string;
  selectedCategoryId: string;
  categories: { id: string; name: string }[];
  isCategoriesLoading: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export function QuizListFilters({
  search,
  selectedCategoryId,
  categories,
  isCategoriesLoading,
  onSearchChange,
  onCategoryChange,
}: QuizListFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search Input - Tăng chiều cao và thêm Icon */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50" />
        <Input
          placeholder="Tìm kiếm bài kiểm tra..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 rounded-2xl border-border/60 bg-card pl-10 pr-10 shadow-sm focus-visible:ring-primary/20"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-muted"
          >
            <X className="size-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Category Select - Thay thế select mặc định */}
      <div className="w-full sm:w-[220px]">
        {isCategoriesLoading ? (
          <Skeleton className="h-11 w-full rounded-2xl" />
        ) : (
          <Select
            value={selectedCategoryId || "all"}
            onValueChange={(value) =>
              onCategoryChange(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="h-11 rounded-2xl border-border/60 bg-card shadow-sm focus:ring-primary/20">
              <div className="flex items-center gap-2">
                <LayoutGrid className="size-4 text-muted-foreground/60" />
                <SelectValue placeholder="Tất cả danh mục" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/60 shadow-xl">
              <SelectItem value="all" className="rounded-lg font-medium">
                Tất cả danh mục
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id} className="rounded-lg">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
