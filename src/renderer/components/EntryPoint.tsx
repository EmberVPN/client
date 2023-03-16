import useData from "../util/hooks/useData";
import { useUser } from "../util/hooks/useUser";
import Servers from "./Servers";
import Spinner from "./Spinner";

export default function EntryPoint(): JSX.Element | null {

	const { user, isLoading } = useUser();
	const { data: subscription, isLoading: isSubscriptionLoading } = useData("/ember/subscription");

	if (isLoading || isSubscriptionLoading) return (
		<div className="grow h-full flex">
			<Spinner className="m-auto w-12" />
		</div>
	);

	if (subscription === undefined || !subscription.success || !user) {
		if (import.meta.env.DEV) return null;
		window.open("//embervpn.org/plans");
		window.close();
		return null;
	}

	// Get the product ID from the subscription
	// const { product } = subscription.items.data[0].plan;

	return (
		<div className="p-4 m-4 rounded-lg bg-gray-200 dark:bg-gray-800 grow flex flex-col gap-4">
			<Servers />
		</div>
	);
}