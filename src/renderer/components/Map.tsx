import { useEffect, useRef } from "react";
import { MdLocationOn } from "react-icons/md";
import map from "../assets/map.svg";
import Server from "./Server";

export default function Map({ servers }: { servers: Ember.Server[] }): JSX.Element {

	const SCALE_BOUNDS = .8;
	
	const ref = useRef<HTMLDivElement>(null);

	useEffect(function() {

		// get image
		const image = ref.current?.querySelector("img") as HTMLImageElement;
		const items = ref.current?.querySelector(".items") as HTMLDivElement;

		function render(e?: MouseEvent | WheelEvent | UIEvent) {
			if (!ref.current) return;
			
			// Get width and height of image
			const width = image.clientWidth;
			const height = image.clientHeight;
			
			// Get aspect ratio
			const aspectRatio = image.naturalWidth / image.naturalHeight;

			if (e instanceof WheelEvent) {
				
				// get a new scale value
				const scale = 1 + e.deltaY * -0.001;

				// get new width and height
				const newHeight = height * scale;

				// Make sure you cant go so big the image height is bigger than the screen height
				if (newHeight > ref.current.clientHeight / SCALE_BOUNDS) return;
				if (newHeight * aspectRatio < ref.current.clientWidth * SCALE_BOUNDS) return;

				// set new size
				image.style.height = `${ newHeight }px`;
				image.style.width = `${ newHeight * aspectRatio }px`;
				render();
				
			} else if (e instanceof MouseEvent) {

				// Allow panning
				if (!e.buttons) return;

				// Get the current image position
				const top = parseInt(image.style.top) + e.movementY;
				const left = parseInt(image.style.left) + e.movementX;

				const BOUNDRY_X = ref.current.clientWidth * (1 - SCALE_BOUNDS) / 2;
				const BOUNDRY_Y = ref.current.clientHeight * (1 - SCALE_BOUNDS) / 2;

				if (top > BOUNDRY_Y) return;
				if (left > BOUNDRY_X) return;
				if (top < ref.current.clientHeight - height - BOUNDRY_Y) return;
				if (left < ref.current.clientWidth - width - BOUNDRY_X) return;

				// Set new position
				image.style.left = `${ left }px`;
				image.style.top = `${ top }px`;

				console.log({ top, left });

			} else {

				// If the image size is unset
				if (!image.style.height || image.style.height === "auto") {
					image.style.height = `${ ref.current.clientHeight }px`;
					image.style.width = `${ ref.current.clientHeight * aspectRatio }px`;
				}

				// Center image
				image.style.top = `${ (ref.current.clientHeight - image.clientHeight) / 2 }px`;
				image.style.left = `${ (ref.current.clientWidth - image.clientWidth) / 2 }px`;
			
			}

			// Make items same size as image
			items.style.height = image.style.height;
			items.style.width = image.style.width;
			items.style.top = image.style.top;
			items.style.left = image.style.left;

		}

		// Make sure the image is loaded first otherwise nothing will work
		image.addEventListener("load", function() {
			if (!ref.current) return;

			// Make image draggable
			ref.current.onmousemove = render;
			ref.current.onwheel = render;
			window.onresize = function() {
				image.style.height = "auto";
				render();
			};
			render();

		});

	}, [ ]);

	return (
		<div className="relative top-0 left-0 w-full h-full"
			ref={ ref }>
			
			<img alt=""
				className="absolute top-0 left-0 max-w-none opacity-25"
				src={ map } />
		
			<div className="items z-10 absolute">
				{servers.map((server, key) => (
					<div className="absolute group bg-red-500 mx-6 shadow-2xl hover:z-10"
						key={ key }
						style={{
							top: `${ (90 - parseFloat(server.location.latitude)) / 180 * 100 }%`,
							left: `${ (120 + parseFloat(server.location.longitude)) / 240 * 100 }%`,
						}}>
						<Server server={ server } />
					</div>
				)) }
			</div>

		</div>
	);
}