import { useAuthStore } from "@/store/authStore";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Image, View } from "react-native";
import { Divider, IconButton, Menu } from "react-native-paper";

const HomeTopNavBar = () => {
	const [visible, setVisible] = useState(false);
	const { logout, user, datasource, setDatasource } = useAuthStore();

	const closeMenu = useCallback(() => {
		setVisible(false);
	}, []);

	const openMenu = useCallback(() => {
		setVisible(true);
	}, []);

	const handleLogout = useCallback(() => {
		router.push({ pathname: "/" });
		logout();
	}, [logout]);

	const handleChangeDatasource = () => {
		setDatasource(datasource === "live" ? "dev" : "live");
		router.push({ pathname: "/" });
		logout();
	};

	return (
		<View
			style={{
				flex: 1,
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "space-between",
				paddingHorizontal: 20,
			}}
		>
			<Image
				style={{ width: 40, height: 40 }}
				source={require("@/assets/images/svgs/savvylogo.svg")}
			/>

			<Menu
				visible={visible}
				onDismiss={closeMenu}
				anchor={<IconButton onPress={openMenu} icon={"menu"} size={32} />}
				anchorPosition="bottom"
			>
				<Divider />
				{user?.role?.name === "Savvy" && (
					<Menu.Item
						leadingIcon={"database"}
						onPress={handleChangeDatasource}
						title={`Datasource: ${datasource}`}
					/>
				)}
				<Menu.Item
					leadingIcon={"logout-variant"}
					onPress={handleLogout}
					title="Logout"
				/>
			</Menu>
		</View>
	);
};

export default HomeTopNavBar;
