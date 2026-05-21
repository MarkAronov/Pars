import {
	BrowserRouter,
	Redirect,
	Route,
	Switch,
	useParams,
} from "react-router-dom";

import ContainerPage from "./ContainerPage";

import AboutPage from "../6-pages/AboutPage";
import ErrorPage from "../6-pages/ErrorPage";
import ExplorePage from "../6-pages/ExplorePage";
import HomePage from "../6-pages/HomePage";
import InterestsPage from "../6-pages/InterestsPage";
import SettingsPage from "../6-pages/SettingsPage";
import StartPage from "../6-pages/StartPage";
import UserPage from "../6-pages/UserPage";

import Login from "../3-molecules/Login";
import SignUp from "../3-molecules/SignUp";
import StartButtons from "../3-molecules/StartButtons";

import { useAuth } from "../../hooks/useAuth";

/**
 * Routing function, used for routing the app according to a given url
 * @return {JSX.Element} the specific page
 */
const PageRouter = () => {
	const auth = useAuth();

	const UserRoute = () => {
		const { username } = useParams<{ username: string }>();
		return <UserPage username={username ? username : ''} />;
	};

	return (
		<BrowserRouter>
			<Switch>
				<Route exact path="/">
					{auth?.userToken ? <Redirect to="/home" /> : <Redirect to="/start" />}
				</Route>
				<Route path="/about">
					<AboutPage />
				</Route>
				<Route path="/home">
					<ContainerPage page={<HomePage />} />
				</Route>
				<Route path="/explore">
					{auth?.userToken ? (
						<ContainerPage page={<ExplorePage />} />
					) : (
						<Redirect to="/start" />
					)}
				</Route>
				<Route path="/interests">
					{auth?.userToken ? (
						<ContainerPage page={<InterestsPage />} />
					) : (
						<Redirect to="/start" />
					)}
				</Route>
				<Route path="/settings">
					{auth?.userToken ? (
						<ContainerPage page={<SettingsPage />} />
					) : (
						<Redirect to="/start" />
					)}
				</Route>
				<Route path="/user/u/:username">
					<ContainerPage page={<UserRoute />} />
				</Route>
				<Route path="/start">
					{auth?.userToken ? (
						<Redirect to="/home" />
					) : (
						<StartPage page={<StartButtons />} />
					)}
				</Route>
				<Route path="/signup">
					{auth?.userToken ? (
						<Redirect to="/home" />
					) : (
						<StartPage page={<SignUp />} />
					)}
				</Route>
				<Route path="/login">
					{auth?.userToken ? (
						<Redirect to="/home" />
					) : (
						<StartPage page={<Login />} />
					)}
				</Route>
				<Route path="*">
					<ErrorPage />
				</Route>
			</Switch>
		</BrowserRouter>
	);
};

export default PageRouter;
