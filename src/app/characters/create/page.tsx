"use client";

import { useSearchParams } from "next/navigation";
import CharacterFormComponent from "@/components/character-form";
import SidebarLayout from "@/components/sidebar-layout";

export default function CreateCharacterPage() {
	const searchParams = useSearchParams();
	const initialName = searchParams.get("name") || undefined;

	return (
		<SidebarLayout>
			<CharacterFormComponent mode="create" initialName={initialName} />
		</SidebarLayout>
	);
}
