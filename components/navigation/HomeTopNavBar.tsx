import React from "react";
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
	}, [setVisible]);

	const openMenu = useCallback(() => {
		setVisible(true);
	}, [setVisible]);

	const handleLogout = useCallback(() => {
		router.push({ pathname: "/" });
		logout();
	}, [logout]);

	const handleChangeDatasource = () => {
		setDatasource(datasource === "live" ? "dev" : "live");
		router.push({ pathname: "/" });
		logout();
	};

	const handleAdminDashboard = () => {
		router.push({ pathname: "/admin" });
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
					<>
						<Menu.Item
							leadingIcon={"database"}
							onPress={handleChangeDatasource}
							title={`Datasource: ${datasource}`}
						/>
						{/* GO to admin dashboard */}
						<Menu.Item
							leadingIcon={"monitor-dashboard"}
							onPress={handleAdminDashboard}
							title="Admin Dashboard"
						/>
					</>
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
