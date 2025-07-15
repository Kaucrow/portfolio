<script lang="ts">
  import deskImg from '$lib/assets/full_room.png'
  import MainCanvas from '$lib/components/MainCanvas.svelte';
  import { Camera } from '$lib/engine/Camera';
  import { Room } from '$lib/engine/Room';
	import { RoomObject } from '$lib/engine/RoomObject';
  import { Sprite } from '$lib/engine/Sprite';

  let mainCanvas: MainCanvas;
  let ctx: CanvasRenderingContext2D | null = null;
  let camera: Camera;
  let room: Room;

  $effect(() => {
    const canvas = mainCanvas.getCanvas();
    ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Failed to get MainCanvas context");
    ctx.imageSmoothingEnabled = false;

    camera = new Camera(canvas.width, canvas.height);

    const roomObjects = [
      new RoomObject(0, 0, new Sprite(deskImg, 2)),
    ];

    room = new Room(1000, 1000, roomObjects);

    const handleResize = () => {
      if (!ctx) throw new Error("MainCanvas context is null");

      room.draw(ctx, camera);
    };
    window.addEventListener('resize', handleResize);

    const loop = () => {
      if (!ctx) throw new Error("MainCanvas context is null");

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      room.draw(ctx, camera);   

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<MainCanvas bind:this={mainCanvas}/>