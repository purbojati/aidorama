"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
	options: { value: string; label: string; category?: string }[];
	selected: string[];
	onChange: (selected: string[]) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	className?: string;
}

export function MultiSelect({
	options,
	selected,
	onChange,
	placeholder = "Select items...",
	searchPlaceholder = "Search...",
	className,
}: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);
	const [search, setSearch] = React.useState("");

	const handleSelect = (value: string) => {
		if (selected.includes(value)) {
			onChange(selected.filter((item) => item !== value));
		} else {
			onChange([...selected, value]);
		}
	};

	const handleRemove = (value: string) => {
		onChange(selected.filter((item) => item !== value));
	};

	const handleClear = () => {
		onChange([]);
	};

	const filteredOptions = options.filter((option) =>
		option.label.toLowerCase().includes(search.toLowerCase()),
	);

	// Group options by category
	const groupedOptions = filteredOptions.reduce(
		(acc, option) => {
			const category = option.category || "Other";
			if (!acc[category]) {
				acc[category] = [];
			}
			acc[category].push(option);
			return acc;
		},
		{} as Record<string, typeof options>,
	);

	return (
		<div className={cn("w-full", className)}>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						aria-expanded={open}
						className="h-auto min-h-10 w-full justify-between bg-background hover:bg-accent hover:text-accent-foreground"
					>
						<div className="flex flex-1 flex-wrap gap-1">
							{selected.length === 0 ? (
								<span className="text-muted-foreground">{placeholder}</span>
							) : (
								selected.map((value) => {
									const option = options.find((opt) => opt.value === value);
									return (
										<Badge
											key={value}
											variant="secondary"
											className="cursor-pointer text-xs transition-colors hover:bg-secondary/80"
											onClick={(e: React.MouseEvent) => {
												e.stopPropagation();
												handleRemove(value);
											}}
										>
											{option?.label || value}
											<X className="ml-1 h-3 w-3 transition-colors hover:text-destructive" />
										</Badge>
									);
								})
							)}
						</div>
						<div className="flex items-center gap-2">
							{selected.length > 0 && (
								<Button
									variant="ghost"
									size="sm"
									className="h-4 w-4 p-0 transition-colors hover:bg-destructive/10 hover:text-destructive"
									onClick={(e: React.MouseEvent) => {
										e.stopPropagation();
										handleClear();
									}}
								>
									<X className="h-4 w-4" />
								</Button>
							)}
							<ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
						</div>
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="w-[var(--radix-popover-trigger-width)] p-0"
					align="start"
				>
					<div className="border-b bg-muted/30 p-3">
						<div className="flex items-center rounded-md border bg-background px-3">
							<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
							<Input
								placeholder={searchPlaceholder}
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="h-8 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
							/>
						</div>
					</div>
					<div className="max-h-60 overflow-y-auto">
						{Object.keys(groupedOptions).length === 0 ? (
							<div className="py-6 text-center text-muted-foreground text-sm">
								No items found.
							</div>
						) : (
							Object.entries(groupedOptions).map(
								([category, categoryOptions]) => (
									<div key={category} className="p-1">
										<div className="mx-1 rounded-sm bg-muted/50 px-2 py-1.5 font-medium text-muted-foreground text-xs">
											{category}
										</div>
										{categoryOptions.map((option) => (
											<button
												key={option.value}
												type="button"
												className={cn(
													"relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
													selected.includes(option.value) &&
														"bg-primary/10 font-medium text-primary",
												)}
												onClick={() => handleSelect(option.value)}
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4 text-primary",
														selected.includes(option.value)
															? "opacity-100"
															: "opacity-0",
													)}
												/>
												{option.label}
											</button>
										))}
									</div>
								),
							)
						)}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}
