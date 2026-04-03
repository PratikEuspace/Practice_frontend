import { useNavigation } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    // Get the full navigation state
    const state = navigation.getState();
    const routes = state?.routes;

    if (routes && routes.length > 1) {
      // The previous page is the one just before the last one (index - 2)
      const previousPage = routes[routes.length - 2];
      console.log("Redirected to 404 from:", previousPage.name);
    } else {
      console.log(
        "404 triggered on initial launch (likely index.tsx is missing)",
      );
    }
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>404 - Not Found</Text>
      <Text style={{ marginTop: 10, color: "gray" }}>
        The page you are looking for does not exist.
      </Text>
    </View>
  );
}
