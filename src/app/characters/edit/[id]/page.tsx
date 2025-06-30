"use client";

import { useParams } from "next/navigation";
import CharacterFormComponent from "@/components/character-form";
import SidebarLayout from "@/components/sidebar-layout";

export default function EditCharacterPage() {
	const params = useParams();
	const id = params.id as string;
	
	// Validate that we have a valid character ID
	if (!id || id === 'undefined') {
		return (
			<SidebarLayout>
				<div className="container mx-auto max-w-4xl px-4 py-6 lg:py-8">
					<div className="text-center">
						<h1 className="text-2xl font-bold mb-4">Character Not Found</h1>
						<p className="text-gray-600 mb-4">The character ID is invalid or missing.</p>
						<a href="/characters" className="text-blue-600 hover:underline">
							Return to Characters
						</a>
					</div>
				</div>
			</SidebarLayout>
		);
	}
	
	const characterId = Number.parseInt(id);
	
	// Validate that the parsed ID is a valid number
	if (isNaN(characterId)) {
		return (
			<SidebarLayout>
				<div className="container mx-auto max-w-4xl px-4 py-6 lg:py-8">
					<div className="text-center">
						<h1 className="text-2xl font-bold mb-4">Invalid Character ID</h1>
						<p className="text-gray-600 mb-4">The character ID must be a valid number.</p>
						<a href="/characters" className="text-blue-600 hover:underline">
							Return to Characters
						</a>
					</div>
				</div>
			</SidebarLayout>
		);
	}

	return (
		<SidebarLayout>
			<CharacterFormComponent mode="edit" characterId={characterId} />
		</SidebarLayout>
	);
}
