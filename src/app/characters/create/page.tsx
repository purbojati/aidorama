import CharacterFormComponent from "@/components/character-form";
import SidebarLayout from "@/components/sidebar-layout";
import { generatePageSEO } from "@/lib/seo";

export const metadata = generatePageSEO("create");

export default function CreateCharacterPage() {
	return (
		<SidebarLayout>
			<CharacterFormComponent mode="create" />
		</SidebarLayout>
	);
}
