import classNames from "classnames";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { refetch } from "../../util/refetch";
import Spinner from "../Spinner";
import Button from "./Button";
import Checkbox from "./Checkbox";
import InputField from "./InputField";

export default function Authorize(): JSX.Element {

	const [ loading, setLoading ] = useState(false);
	const [ needsToken, setNeedsToken ] = useState(false);
	const ref = useRef<HTMLFormElement>(null);

	function Vectors() {
		return (
			<>
				<svg className="absolute top-2/3 -right-1/2 -translate-y-1/2 -z-[1] scale-150"
					version="1.1"
					viewBox="0 0 500 500"
					width="100%"
					xmlns="http://www.w3.org/2000/svg">
					<path className="fill-amber-500/25">
						<animate attributeName="d"
							dur="25s"
							repeatCount="indefinite"
							values="M403.5,294Q372,338,343,393Q314,448,254,435.5Q194,423,138,397.5Q82,372,88,311Q94,250,86,187.5Q78,125,134,95.5Q190,66,253,57Q316,48,362,91.5Q408,135,421.5,192.5Q435,250,403.5,294Z;M469.34657,320.38487Q443.8468,390.76973,373.53877,402.1156Q303.23073,413.46147,238.88463,448.30757Q174.53853,483.15367,122.76833,431.6929Q70.99814,380.23213,76.84563,315.11607Q82.69313,250,78.9227,186.3071Q75.15227,122.6142,131.92223,91.73003Q188.6922,60.84587,253.2305,51.539Q317.7688,42.23213,359.5759,90.92433Q401.383,139.61653,448.11467,194.80827Q494.84633,250,469.34657,320.38487Z;M428.88107,298.41731Q382.87896,346.83463,343.6411,381.94757Q304.40324,417.06052,249.73188,417.66327Q195.06052,418.26602,121.90324,407.33463Q48.74595,396.40324,42.90922,323.20162Q37.07249,250,50.04223,182.03624Q63.01197,114.07249,129.2076,98.49191Q195.40324,82.91133,251.0746,78.83673Q306.74595,74.76214,356.50598,105.64321Q406.26602,136.52427,440.5746,193.26214Q474.88318,250,428.88107,298.41731Z;M424.84079,321.86371Q447.86386,393.72743,384.56836,431.15935Q321.27286,468.59128,248.86371,472.84107Q176.45457,477.09086,148.84107,410.1135Q121.22757,343.13614,67.95457,296.56807Q14.68157,250,76.45485,209.5685Q138.22813,169.13699,166.2505,123.59142Q194.27286,78.04585,249.70464,79.81828Q305.13643,81.59072,362.47721,103.93179Q419.818,126.27286,410.81786,188.13643Q401.81772,250,424.84079,321.86371Z;M402.82336,294.74662Q372.52122,339.49324,339.45366,380.77461Q306.3861,422.05598,251.70463,416.9165Q197.02317,411.77702,159.66506,377.28619Q122.30695,342.79537,72.75579,296.39768Q23.20463,250,37.88851,178.24662Q52.57238,106.49324,117.0304,72.97924Q181.48842,39.46525,238.53957,73.79537Q295.59073,108.12549,332.49083,135.50917Q369.39092,162.89286,401.2582,206.44643Q433.12549,250,402.82336,294.74662Z;M403.5,294Q372,338,343,393Q314,448,254,435.5Q194,423,138,397.5Q82,372,88,311Q94,250,86,187.5Q78,125,134,95.5Q190,66,253,57Q316,48,362,91.5Q408,135,421.5,192.5Q435,250,403.5,294Z" />
					</path>
				</svg>
				<svg className="absolute top-1/2 -right-1/2 -translate-y-1/2 -z-[1] scale-125"
					version="1.1"
					viewBox="0 0 500 500"
					width="100%"
					xmlns="http://www.w3.org/2000/svg">
					<path className="fill-orange-500/25">
						<animate attributeName="d"
							dur="25s"
							repeatCount="indefinite"
							values="M394.89432,291.86359Q379.96349,333.72718,354.5999,379.04899Q329.23631,424.37079,274.96542,439.22911Q220.69452,454.08742,185.59462,409.0927Q150.49472,364.09798,125.7075,328.96349Q100.92028,293.82901,59.42363,237.80355Q17.92698,181.77809,66.30163,137.5999Q114.67627,93.42171,168.36359,75.4145Q222.05091,57.4073,282.76369,51.5999Q343.47647,45.7925,374.93276,97.57444Q406.38905,149.35639,408.1071,199.67819Q409.82516,250,394.89432,291.86359Z;M440.79254,295.90011Q393.21514,341.80021,357.53347,375.20746Q321.85181,408.61471,271.82218,427.01866Q221.79254,445.4226,171.55544,422.09659Q121.31834,398.77057,68.79254,358.84083Q16.26674,318.91109,38.15202,256.60373Q60.03731,194.29637,79.65586,134.88912Q99.27441,75.48187,157.19648,42.12622Q215.11855,8.77057,268.67782,50.11855Q322.2371,91.46653,362.16684,121.87761Q402.09659,152.2887,445.23326,201.14435Q488.36994,250,440.79254,295.90011Z;M432.03478,297.56957Q398.46218,345.13914,356.36479,367.83696Q314.26739,390.53478,267.26739,423.085Q220.26739,455.63521,175.78826,421.28282Q131.30913,386.93043,88.83152,348.48609Q46.35391,310.04174,68.21174,256.28131Q90.06957,202.52087,95.17544,139.65457Q100.28131,76.78826,162.38717,74.23956Q224.49304,71.69087,270.52087,88.04326Q316.5487,104.39565,381.35239,113.97913Q446.15608,123.56261,455.88173,186.78131Q465.60739,250,432.03478,297.56957Z;M415.01911,310.8863Q439.5452,371.7726,388.0904,405.2945Q336.6356,438.8164,280.7726,433.452Q224.9096,428.08761,185.95759,398.74511Q147.00559,369.40261,129.05219,330.15471Q111.09878,290.9068,102.89189,247.863Q94.68499,204.8192,97.4315,140.3164Q100.17801,75.81361,160.4068,60.51771Q220.6356,45.22181,275.226,60.1356Q329.8164,75.04939,372.9534,109.3658Q416.0904,143.6822,403.29171,196.8411Q390.49301,250,415.01911,310.8863Z;M440.89145,308.17188Q431.49014,366.34375,386.51892,408.54441Q341.5477,450.74507,280.86143,454.67188Q220.17516,458.59868,161.4046,439.6065Q102.63404,420.61431,74.24712,365.23068Q45.86019,309.84704,51.25164,251.37253Q56.64309,192.89803,94.98232,154.25946Q133.32155,115.62089,180.13528,103.21957Q226.94901,90.81826,286.5366,64.96012Q346.12418,39.10197,382.33594,90.33923Q418.5477,141.57648,434.42023,195.78824Q450.29277,250,440.89145,308.17188Z;M430.80624,308.72934Q432.1339,367.45868,372.72647,377.66948Q313.31905,387.88027,263.72647,442.80911Q214.1339,497.73795,154.61821,463.08837Q95.10253,428.43879,60.15953,372.16526Q25.21653,315.89174,60.3661,260.16239Q95.51568,204.43305,120.04418,166.21939Q144.57268,128.00574,181.94874,82.19376Q219.32479,36.38179,273.74216,57.19376Q328.15953,78.00574,384.05413,102.85329Q439.94874,127.70084,434.71366,188.85042Q429.47858,250,430.80624,308.72934Z;M394.89432,291.86359Q379.96349,333.72718,354.5999,379.04899Q329.23631,424.37079,274.96542,439.22911Q220.69452,454.08742,185.59462,409.0927Q150.49472,364.09798,125.7075,328.96349Q100.92028,293.82901,59.42363,237.80355Q17.92698,181.77809,66.30163,137.5999Q114.67627,93.42171,168.36359,75.4145Q222.05091,57.4073,282.76369,51.5999Q343.47647,45.7925,374.93276,97.57444Q406.38905,149.35639,408.1071,199.67819Q409.82516,250,394.89432,291.86359Z" />
					</path>
				</svg>
			</>
		);
	}

	async function signin(e: React.FormEvent<HTMLFormElement>) {

		// Stop reloading
		e.preventDefault();
		
		// Get form
		const form = ref.current;
		if (!form) return;
		
		// Validate form
		if (!form.checkValidity()) return;

		// Start loading
		setLoading(true);
		
		// Get object of form data
		const formData = Object.fromEntries(new FormData(form).entries());
		
		// Sign in
		const resp = await fetch(APIROOT + "/auth/session", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...formData, noredirect: true }),
		});

		// If we need to get a 2fa code
		if (resp.status === 417) {
			setLoading(false);
			return setNeedsToken(true);
		}
		
		// Parse response
		const json = await resp.json();

		// If we got an error
		if (resp.status !== 200) {
			setLoading(false);
			return toast.error(json.description);
		}

		// Save token
		localStorage.setItem("authorization", json.session_id);

		// Refetch
		setTimeout(() => [ refetch(), setLoading(false) ], 100);

	}

	return (
		<div className="w-full h-full p-4 flex flex-col bg-white dark:bg-gray-800 relative z-[0]"
			id="login-cover">
			<div className="grow flex flex-col">
				<form className="container grow"
					onSubmit={ signin }
					ref={ ref }>
					<div className="grow flex flex-col justify-between">
						<h1 className="text-4xl font-manrope font-bold select-none">Sign In</h1>
						<p className="-mt-6 text-sm text-gray-600 dark:text-gray-400 select-none">with your <a className="text-primary hover:underline underline-offset-2"
							href="//embervpn.org">Ember VPN</a> account</p>
						<InputField
							defaultValue={ localStorage.getItem("last_user") || "" }
							disabled={ loading }
							label="Email address"
							name="email"
							placeholder="you@yourdomain.com"
							required
							type="email" />
						<div className="flex gap-4 w-full">
							<InputField
								className="grow"
								disabled={ loading }
								label="Password"
								name="password"
								required
								type="password" />
							<InputField
								className={ classNames("basis-2/3", !needsToken && "hidden") }
								disabled={ loading }
								hidden={ !needsToken }
								name="token"
								onChange={ e => e.target.value = e.target.value.replace(/[^0-9]/g, "").substring(0, 6) }
								placeholder="2FA Token"
								required={ needsToken }
								type="text" />
						</div>
					</div>
					<div className="flex justify-between items-center">
						<Checkbox defaultChecked
							name="rememberme">Stay signed in</Checkbox>
						<Button className={ classNames("m0", loading && "!bg-opacity-25 !shadow-none pointer-events-none") }
							size="md"
							type="submit">{loading ? <Spinner className="w-6 mx-[19px] !stroke-gray-700 dark:!stroke-white" /> : "Sign In"}</Button>
					</div>
				</form>
				<Vectors />
			</div>
		</div>
	);
}