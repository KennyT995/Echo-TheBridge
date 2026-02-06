import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil } from "lucide-react";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  visionCategories,
  type VisionCategory,
} from "@/features/visions/types";

const EditVisionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  category: z.enum(visionCategories).or(z.literal("")),
});

interface EditVisionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle: string;
  initialCategory: string;
  onUpdate: (title: string, category: string) => Promise<void>;
}

export function EditVisionDialog({
  isOpen,
  onOpenChange,
  initialTitle,
  initialCategory,
  onUpdate,
}: EditVisionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Fallback map for category descriptions since we want to reuse the nice UI
  const categoryDescriptions: Record<string, string> = {
    Career: "Professional growth & success",
    Health: "Physical & mental well-being",
    Financial: "Wealth, savings & stability",
    "Personal Growth": "Skills, hobbies & self",
    Relationships: "Family, friends & connections",
    Legacy: "Impact, contribution & memory",
  };

  const form = useForm<z.infer<typeof EditVisionSchema>>({
    resolver: zodResolver(EditVisionSchema),
    defaultValues: {
      title: initialTitle,
      category: initialCategory as VisionCategory,
    },
  });

  const onSubmit = async (values: z.infer<typeof EditVisionSchema>) => {
    setIsLoading(true);
    await onUpdate(values.title, values.category);
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl glass-card border-white/5 p-0 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -z-10" />

        <DialogHeader className="p-8 pb-6 border-b border-white/5 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-3 text-primary mb-2">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <Pencil className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.4em]">
              Strategic Modification
            </span>
          </div>
          <DialogTitle className="text-4xl font-headline font-bold tracking-tighter">
            Recalibrate <span className="text-gradient">Vision</span>
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground/60 font-light mt-2">
            Adjust the core parameters of your strategic roadmap.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-xl font-bold tracking-tight">Vision Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-14 rounded-2xl glass border-white/10 text-xl px-6 focus-visible:ring-primary/40 bg-white/5 font-light"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-xl font-bold tracking-tight">Sector Allocation</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      {visionCategories.map((category) => (
                        <div key={category}>
                          <RadioGroupItem
                            value={category}
                            id={`edit-${category}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`edit-${category}`}
                            className="flex flex-col items-start justify-center rounded-2xl border border-white/5 p-6 hover:bg-white/5 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer h-full transition-all group"
                          >
                            <span className="font-bold text-lg group-hover:text-primary transition-colors">{category}</span>
                            <span className="text-sm text-muted-foreground/60 mt-1 font-light">
                              {categoryDescriptions[category]}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4 border-t border-white/5 flex gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="h-12 px-6 rounded-xl text-muted-foreground hover:bg-white/5 transition-all"
              >
                Abort
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                {isLoading && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                Commit Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

