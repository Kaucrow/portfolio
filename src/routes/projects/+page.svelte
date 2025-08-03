<script lang="ts">
  import { useScene } from "$lib/engine/Scene.svelte";

  const { sceneState, beginSceneTransition } = useScene();

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
        { type: 'image', src: '/media/soundown/picture_1.png', alt: 'Image 1' },
        { type: 'image', src: '/media/soundown/picture_2.png', alt: 'Image 2' },
        { type: 'image', src: '/media/soundown/picture_3.png', alt: 'Image 3' },
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
      title: "Echoes",
      cardSubtitle: "Note-taking Web App",
      cardTechnologies: ['React'],
      subtitle: "Elegant and secure note-taking web app built with React.",
      githubLink: "https://github.com/Kaucrow/uni/tree/main/frameworks/echo",
      status: "completed",
      mediaItems: [
        { type: 'video', src: '/media/echoes/video_1.mp4', autoplay: true, loop: true, controls: true },
        { type: 'image', src: '/media/echoes/picture_1.png', alt: 'Image 1' },
        { type: 'image', src: '/media/echoes/picture_2.png', alt: 'Image 2' },
        { type: 'image', src: '/media/echoes/picture_3.png', alt: 'Image 3' },
      ],
      description: "**Echoes** is an elegant, full-featured note-taking app built with React that includes secure user authentication (login/register), seamless dark/light theme switching, and comprehensive CRUD functionality, allowing users to effortlessly create, view, edit, and organize their notes in a clean, modern interface.",
      features: [
        "User authentication (login & registration)",
        "Dark/light mode theme switching",
        "Complete note CRUD operations",
        "Modern React-based interface",
        "Intuitive note organization system",
        "Persistent data storage"
      ],
      technologies: ["react", "firebase", "typescript"]
    },
    {
      id: 3,
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
      title: "Fisiks",
      cardSubtitle: "C++ 3D physics engine",
      cardTechnologies: ['C++', 'OpenGL'],
      subtitle: "A C++ 3D physics engine with collision detection and OpenGL examples.",
      githubLink: "https://github.com/Kaucrow/fisiks-engine",
      status: "ongoing",
      mediaItems: [
        { type: 'video', src: '/media/fisiks/video_1.mp4', autoplay: true, loop: true, controls: true },
        { type: 'video', src: '/media/fisiks/video_2.mp4', autoplay: true, loop: true, controls: true },
        { type: 'video', src: '/media/fisiks/video_3.mp4', autoplay: true, loop: true, controls: true },
      ],
      description: "**Fisiks** is a 3D physics engine built in C++ based on the engine showcased in Ian Millington's \"Game Physics Engine Development,\" featuring rigid body dynamics, collision detection, and OpenGL integration for interactive demos.",
      features: [
        "Rigid body dynamics simulation",
        "Broad/narrow-phase collision detection",
        "OpenGL visualization examples",
        "Extensible architecture",
        "Support for forces and constraints",
      ],
      technologies: ["cpp", "opengl"]
    },
    {
      id: 4,
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
      title: "FTPebbles",
      cardSubtitle: "Lightweight FTP server",
      cardTechnologies: ['Rust'],
      subtitle: "A minimal Rust FTP server with active/passive mode support and full RFC 959 compliance.",
      githubLink: "https://github.com/Kaucrow/web-protocols/tree/main/ftp/ftpebbles",
      status: "completed",
      mediaItems: [
        { type: 'video', src: '/media/ftpebbles/video_1.mp4', autoplay: true, loop: true, controls: true },
      ],
      description: "**FTPebbles** (Five Tiny Pebbles) is a lightweight, Rust-based FTP server supporting both active and passive transfer modes, designed for simplicity and reliability with a focus on RFC-compliant file operations.",
      features: [
        "Active and passive transfer modes",
        "RFC 959 compliant core operations",
        "User authentication system",
        "Configurable port and IP binding",
        "ASCII and binary transfer modes",
        "Logging and error reporting",
        "A strange lack of water"
      ],
      technologies: ["rust"]
    },
    {
      id: 5,
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
      title: "SMTPebbles",
      cardSubtitle: "Rust SMTP + API",
      cardTechnologies: ['Rust'],
      subtitle: "A Rust SMTP server with user management API.",
      githubLink: "https://github.com/Kaucrow/web-protocols/tree/kaucrow-smtp-server/smtp",
      status: "ongoing",
      mediaItems: [
        { type: 'video', src: '/media/smtpebbles/video_1.mp4', autoplay: true, loop: true, controls: true },
      ],
      description: "**SMTPebbles** is a Rust-powered SMTP server paired with a backend API for user management, offering seamless email delivery and secure authentication through RESTful endpoints.",
      features: [
        "SMTP protocol implementation (RFC 5321)",
        "User registration/auth API endpoints",
        "Multipart email support",
        "Async I/O via Tokio runtime",
        "Constantly tries to find the solution"
      ],
      technologies: ["rust"]
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

      beginSceneTransition('fromLeft');
    })();
  });
</script>

<StarsBackground />
<WindowScrollArea class="z-10" />

<div class="relative h-screen w-full">
  <div class="grid grid-cols-2 min-h-full w-full relative">
    {#each constellationsData as constellation, i}
      <div
        class="
          relative flex justify-center items-start mt-10
          {i % 2 === 0 ? 'col-start-2 justify-self-start' : 'col-start-1 justify-self-end'}
          py-10
          w-full max-w-[35vw]
        "
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