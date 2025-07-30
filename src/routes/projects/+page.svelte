<script lang="ts">
  import { useScene } from "$lib/engine/Scene.svelte";

  const { sceneState, addRoomObject, beginSceneTransition } = useScene();

  import { Transition } from "$lib/engine/Transition";
  
  import Constellation, { type Star, type StarConnection } from "$lib/components/Constellation.svelte";
  import StarsBackground from "$lib/components/StarsBackground.svelte";
  import WindowScrollArea from "$lib/components/WindowScrollArea.svelte";
  import { type MediaItem } from "$lib/components/Carousel.svelte";

  let pageObjectsInitialized = false;

  const constellationsData: {
    id: number,
    stars: Star[];
    connections: StarConnection[];
    title: string;
    cardSubtitle: string;
    cardTechnologies: string[];
    subtitle: string;
    githubLink: string;
    status: 'completed' | 'ongoing';
    mediaItems: MediaItem[];
    description: string;
    features: string[];
    technologies: string[];
  }[] = [
    {
      id: 1,
      stars: [
        { id: 0, x: 100, y: 50 },
        { id: 1, x: 250, y: 150 },
        { id: 2, x: 150, y: 250 },
        { id: 3, x: 300, y: 300 },
        { id: 4, x: 50, y: 200 },
        { id: 5, x: 350, y: 100 },
      ],
      connections: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 0],
        [4, 2],
        [5, 1],
        [5, 3],
      ],
      title: "Soundown",
      cardSubtitle: "Music Player Web App",
      cardTechnologies: ['React', 'Shadcn'],
      subtitle: "Sleek music player web app built using React, IndexedDB, and Shadcn components.",
      githubLink: "https://github.com/Kaucrow/soundown",
      status: "completed",
      mediaItems: [
        { type: 'image', src: 'https://placehold.co/600x400?text=Hello+World', alt: 'Placeholder Image 1' },
        { type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', autoplay: true, loop: true, controls: true },
        { type: 'image', src: 'https://via.placeholder.com/1280x720/33FF57/FFFFFF?text=Image+2', alt: 'Placeholder Image 2' },
        { type: 'video', src: 'https://www.w3schools.com/html/movie.mp4', autoplay: false, loop: false, controls: true },
        { type: 'image', src: 'https://via.placeholder.com/1280x720/3357FF/FFFFFF?text=Image+3', alt: 'Placeholder Image 3' },
      ],
      description: "**Soundown** is a sleek and intuitive music player built for learning purposes using React and TypeScript, with Shadcn UI components. It uses IndexedDB for efficient and persistent local storage, allowing you to enjoy your music collection directly in your browser.",
      features: [
        "Upload Your Music: Easily add your favorite songs to your personal music library.",
        "Create and Manage Playlists: Organize your tracks into custom playlists for any mood or occasion.",
        "Seamless Playback: Enjoy smooth and uninterrupted music playback.",
        "Song Information Visualization: View detailed information for each song, including title, artist, album, duration & album cover. "
      ],
      technologies: ["react", "shadcn", "indexeddb", "typescript"]
    },
    {
      id: 2,
      stars: [
        { id: 0, x: 100, y: 50 },
        { id: 1, x: 250, y: 150 },
        { id: 2, x: 150, y: 250 },
        { id: 3, x: 300, y: 300 },
        { id: 4, x: 50, y: 200 },
        { id: 5, x: 350, y: 100 },
      ],
      connections: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
        [4, 0],
        [4, 2],
        [5, 1],
        [5, 3],
      ],
      title: "Project Alpha",
      cardSubtitle: "AI Assistant",
      cardTechnologies: ['Python', 'TensorFlow'],
      subtitle: "An intelligent AI assistant for daily tasks.",
      githubLink: "https://github.com/your-username/project-alpha",
      status: "ongoing",
      mediaItems: [
        { type: 'image', src: 'https://placehold.co/600x400?text=Hello+World', alt: 'Placeholder Image 1' },
        { type: 'video', src: 'https://www.w3schools.com/html/mov_bbb.mp4', autoplay: true, loop: true, controls: true },
        { type: 'image', src: 'https://via.placeholder.com/1280x720/33FF57/FFFFFF?text=Image+2', alt: 'Placeholder Image 2' },
        { type: 'video', src: 'https://www.w3schools.com/html/movie.mp4', autoplay: false, loop: false, controls: true },
        { type: 'image', src: 'https://via.placeholder.com/1280x720/3357FF/FFFFFF?text=Image+3', alt: 'Placeholder Image 3' },
      ],
      description: "Project Alpha is an AI-powered assistant designed to streamline your daily routines.",
      features: [
        "Voice commands",
        "Calendar integration",
        "Smart reminders"
      ],
      technologies: ["react", "shadcn", "indexeddb", "typescript"]
    },
  ];

  $effect(() => {
      if (
        !sceneState.isInitialized ||
        !sceneState.room ||
        !sceneState.camera ||
        sceneState.camera.globalScale === 0 ||
        pageObjectsInitialized)
      {
        return;
      }

      pageObjectsInitialized = true;

      (async () => {
        if (!sceneState.camera || !sceneState.room) return;

        sceneState.room.clearObjects();
        sceneState.room.clearTransition();

        beginSceneTransition(
            new Transition('fromLeft', sceneState.camera, () => {
          })
        );
      })();
    }
  );
</script>

<StarsBackground />
<WindowScrollArea class="z-10" />

<div class="relative h-screen w-full">
  <div class="grid grid-cols-2 min-h-full w-full relative">
    {#each constellationsData as constellation, i}
      <div
        class="
          flex justify-center items-start mt-10 z-10
          {i % 2 === 0 ? 'col-start-2 justify-self-start' : 'col-start-1 justify-self-end'}
          py-10
          w-full max-w-[35vw]"
      >
        <Constellation
          id={constellation.id}
          stars={constellation.stars}
          connections={constellation.connections}
          title={constellation.title}
          cardSubtitle={constellation.cardSubtitle}
          cardTechnologies={constellation.cardTechnologies}
          subtitle={constellation.subtitle}
          githubLink={constellation.githubLink}
          status={constellation.status}
          mediaItems={constellation.mediaItems}
          description={constellation.description}
          features={constellation.features}
          technologies={constellation.technologies}
        />
      </div>
    {/each}
  </div>
</div>