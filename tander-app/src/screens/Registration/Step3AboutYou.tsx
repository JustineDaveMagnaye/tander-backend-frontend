import PillSelector from "@/src/components/forms/PillSelector";
import TextInputField from "@/src/components/forms/TextInputField";
import ProgressBar from "@/src/components/ui/ProgressBar";
import { useFormikContext } from "formik";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Typed navigation
import { Step3Nav } from "@/src/navigation/NavigationTypes";

interface Props {
  navigation: Step3Nav;
}

export default function Step3AboutYou({ navigation }: Props) {
  const { values, setFieldValue, handleSubmit } = useFormikContext<any>();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <ProgressBar step={3} total={3} />
      <Text style={styles.step}>Step 3 of 3</Text>

      <View style={styles.card}>
        <Text style={styles.header}>About You</Text>

        {/* BIO */}
        <TextInputField
          label="Short Bio"
          value={values.bio}
          onChangeText={(t) => setFieldValue("bio", t)}
          multiline
        />

        {/* INTERESTS */}
        <Text style={styles.section}>Interests</Text>
        <PillSelector
          items={["Travel", "Music", "Sports", "Art", "Cooking", "Fitness"]}
          value={values.interests}
          onChange={(val) => setFieldValue("interests", val)}
        />

        {/* LOOKING FOR */}
        <Text style={styles.section}>Looking For</Text>
        <PillSelector
          items={["Connect", "Companionship", "Dating", "Socialize"]}
          value={values.lookingFor}
          onChange={(val) => setFieldValue("lookingFor", val)}
        />
      </View>

      {/* FOOTER BUTTONS */}
      <View style={styles.footer}>
        {/* BACK BUTTON */}
        <TouchableOpacity
          style={styles.back}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* COMPLETE BUTTON */}
        <TouchableOpacity
          style={styles.next}
          onPress={() => handleSubmit()} // <-- FIXED: Wrapped to avoid RN event mismatch
        >
          <Text style={styles.nextText}>Complete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  step: { marginBottom: 10, fontSize: 14 },
  header: { fontSize: 18, fontWeight: "700" },
  card: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    marginBottom: 30,
  },
  section: {
    marginTop: 20,
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  back: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  backText: {
    color: "#222",
    fontSize: 16,
  },
  next: {
    backgroundColor: "#F5A14B",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
  },
  nextText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
