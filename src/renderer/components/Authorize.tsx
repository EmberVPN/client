import { useEffect, useRef, useState } from "react";
import User from "../util/class/User";
import { refetch } from "../util/refetch";
import { uuid } from "../util/uuid";
import InputGroup from "./InputGroup";
import Spinner from "./Spinner";

export default function Authorize(): JSX.Element {

	const ref = useRef<HTMLFormElement>(null);
	
	// Initialize states
	const [ partial, setPartial ] = useState<Auth.Partial | null>(null);
	
	const emailUUID = uuid();
	const passwUUID = uuid();
	
	function scrollTo(index: number) {
		
		const slideWidth = ref.current?.clientWidth ?? 0;
		const slideHeight = ref.current?.children[index].clientHeight ?? 0;
		
		// Scroll to the specified slide index
		ref.current?.scrollTo({
			left: index * slideWidth,
			behavior: "smooth"
		});

		// Set the height of the container to the height of the current slide
		if (ref.current) ref.current.style.height = `${ slideHeight }px`;
		
	}
	
	useEffect(() => scrollTo(0), []);
	
	function EmailSlide() {
		
		// Initialize states
		const [ error, setError ] = useState<string | null>(null);
		const [ loading, setLoading ] = useState(false);

		async function next() {

			document.querySelector("input")?.blur();

			// Clear state
			setError(null);
			setLoading(true);
			
			// Get email
			const email = (document.getElementById(emailUUID) as HTMLInputElement).value;
			
			// Send request
			const resp = await fetch(APIROOT + "/auth/details", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ email })
			});
			
			const json: APIResponse<Auth.Partial> = await resp.json();
			
			// Stop loading
			setLoading(false);
			
			// If failed
			if (!json.success) return setError(json.readable ?? json.description);
			
			// Set partial
			setPartial(json);
			
			// Scroll to next
			scrollTo(1);
			
		}

		return (
			<div className="w-full inline-block p-4 align-top">
				
				<InputGroup
					autoComplete="current-email"
					defaultValue={ partial?.email }
					error={ error }
					id={ emailUUID }
					label="Email address"
					name="email"
					onKeyDown={ e => e.key === "Enter" && next() }
					placeholder="you@example.com"
					type="email" />
				
				<hr className="-mx-4 my-4 dark:border-gray-700/70" />
				<div className="flex justify-end gap-4">
					<button className="btn primary"
						onClick={ next }
						type="button">{ loading ? <Spinner className="w-5 mx-2" /> : "Next" }</button>
				</div>
			</div>
		);
		
	}
	
	function PasswSlide() {
		
		// Initialize states
		const [ error, setError ] = useState<string | null>(null);
		const [ loading, setLoading ] = useState(false);

		async function next() {

			document.querySelector("input")?.blur();

			// Clear state
			setError(null);
			setLoading(true);
			
			// Get email and password
			const email = (document.getElementById(emailUUID) as HTMLInputElement).value;
			const password = (document.getElementById(passwUUID) as HTMLInputElement).value;
			
			// // Send request
			const resp = await fetch(APIROOT + "/auth/session", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password, rememberme: true, noredirect: true })
			});
			
			const json: APIResponse<{ session_id: string }> = await resp.json();
			
			// Stop loading
			setLoading(false);
			
			// Check for 2 factor
			if (resp.status === 417) return scrollTo(2);
			
			// If failed
			if (!json.success) return setError(json.readable ?? json.description);
			
			// Close modal
			localStorage.setItem("authorization", json.session_id);

			// Refetch user
			setTimeout(refetch, 100);
			
		}

		return (
			<div className="w-full inline-block p-4 align-top">
				<div className="flex justify-center mb-2">
					<div className="inline-flex rounded-full border border-gray-700/70 items-center justify-center gap-1 bg-gray-200/20 dark:bg-gray-700/20 select-none">
						<img alt={ partial?.username }
							className="w-12 h-12 rounded-full p-1"
							onLoad={ () => scrollTo(1) }
							src={ User.getAvatarURL(partial?.id ?? 0) } />
						<p className="pr-4 flex flex-col leading-none">
							<span className="font-medium">{partial?.username}</span>
							<span className="text-xs">{partial?.email}</span>
						</p>
					</div>
				</div>
				
				<InputGroup
					autoComplete="current-password"
					error={ error }
					id={ passwUUID }
					label="Password"
					name="password"
					onKeyDown={ e => e.key === "Enter" && next() }
					type="password" />
				
				<hr className="-mx-4 my-4 dark:border-gray-700/70" />

				<div className="flex justify-end gap-4">
					<button className="btn"
						onClick={ () => scrollTo(0) }
						type="button">Back</button>
					<div className="grow" />
					<button className="btn primary"
						onClick={ next }
						type="button">{ loading ? <Spinner className="w-5 mx-2" /> : partial?.mfa_enabled ? "Next" : "Sign in" }</button>
				</div>
			</div>
		);
		
	}
	
	function MultiSlide() {

		const tokenUUID = uuid();
		
		// Initialize states
		const [ error, setError ] = useState<string | null>(null);
		const [ loading, setLoading ] = useState(false);

		async function next() {

			document.querySelector("input")?.blur();

			// Clear state
			setError(null);
			setLoading(true);
			
			// Get email and password
			const email = (document.getElementById(emailUUID) as HTMLInputElement).value;
			const password = (document.getElementById(passwUUID) as HTMLInputElement).value;
			const rememberme = (document.getElementById("rememberme") as HTMLInputElement).checked;
			const token = (document.getElementById(tokenUUID) as HTMLInputElement).value;
			
			// // Send request
			const resp = await fetch(APIROOT + "/auth/session", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ email, password, token, rememberme, noredirect: true })
			});

			const json: APIResponse<{ session_id: string }> = await resp.json();
			
			// Stop loading
			setLoading(false);
			
			// If failed
			if (!json.success) return setError(json.readable ?? json.description);
			
			// Close modal
			localStorage.setItem("session_id", json.session_id);

			// Refetch user
			setTimeout(refetch, 100);
			
		}

		return (
			<div className="w-full inline-block p-4 align-top">
				
				<InputGroup
					error={ error }
					id={ tokenUUID }
					label="2FA Token"
					maxLength={ 6 }
					name="token"
					onKeyDown={ e => e.key === "Enter" ? next() : isNaN(parseInt(e.key)) && e.key.length === 1 && e.preventDefault() }
					onKeyUp={ e => e.currentTarget.value.length === 6 && next() } />
				
				<hr className="-mx-4 my-4 dark:border-gray-700/70" />
				<div className="flex justify-end gap-4">
					<button className="btn"
						onClick={ () => scrollTo(1) }
						type="button">Back</button>
					<div className="grow" />
					<button className="btn primary"
						onClick={ next }
						type="button">{ loading ? <Spinner className="w-5 mx-2" /> : "Sign in" }</button>
				</div>
			</div>
		);
		
	}
	
	return (
		<div className="relative my-auto bg-white rounded-lg shadow-2xl transition-transform mx-auto dark:bg-gray-800 dark:text-white border dark:border-gray-600/50 max-h-[calc(100vh_-_2rem)] w-[440px]">

			<h1 className="text-center text-2xl font-medium p-4">Sign in</h1>
			<hr className="dark:border-gray-700/70" />
			<form className="w-full whitespace-nowrap overflow-hidden transition-[height,margin-top] duration-[440ms]"
				ref={ ref }>
				<EmailSlide />
				<PasswSlide />
				<MultiSlide />
			</form>

		</div>
	);
}