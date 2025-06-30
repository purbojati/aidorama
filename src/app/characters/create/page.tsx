import CharacterFormComponent from "@/components/character-form";
import SidebarLayout from "@/components/sidebar-layout";

export default function CreateCharacterPage() {
	return (
		<SidebarLayout>
			<CharacterFormComponent mode="create" />
		</SidebarLayout>
	);
}
