import { useAuthStore } from "@/store/authStore";
import { router } from "expo-router";
import { useState } from "react";
import { Image, View } from "react-native";
import { Divider, IconButton, Menu } from "react-native-paper";

const HomeTopNavBar = () => {
  const [visible, setVisible] = useState(false);
  const { logout } = useAuthStore();
  const closeMenu = () => {
    setVisible(false);
  };

  const openMenu = () => {
    setVisible(true);
  };
  const handleLogout = () => {
    router.push("/");
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
        source={require("@/assets/images/savvylogo.svg")}
      />

      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={<IconButton onPress={openMenu} icon={"menu"} size={32} />}
        anchorPosition="bottom"
      >
        <Divider />
        <Menu.Item
          leadingIcon={"logout-variant"}
          onPress={handleLogout}
          title="Logout"
        />{" "}
      </Menu>
    </View>
  );
};

export default HomeTopNavBar;
