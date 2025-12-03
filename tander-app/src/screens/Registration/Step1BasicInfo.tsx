import ProgressBar from "@/src/components/ui/ProgressBar";
import { getErrorString } from "@/src/utility/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useFormikContext } from "formik";
import React from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import FullScreen from "@/src/components/layout/FullScreen";
import { Step1Nav } from "@/src/navigation/NavigationTypes";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import SelectField from "../../components/forms/SelectField";
import TextInputField from "../../components/forms/TextInputField";
import DatePickerInput from "../../components/inputs/DatePickerInput";
import PickerModal from "../../components/modals/PickerModal";
import colors from "../../config/colors";
import {
  CIVIL_STATUS_OPTIONS,
  COUNTRIES,
  HOBBY_OPTIONS,
  PHILIPPINES_CITIES,
} from "../../constants/formData";
import { useSlideUp } from "../../hooks/useFadeIn";

interface Props {
  navigation: Step1Nav;
}

export default function Step1BasicInfo({ navigation }: Props) {
  const {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    validateForm,
    setTouched,
  } = useFormikContext<any>();

  // Animations
  const headerAnim = useSlideUp(500, 0, 30);
  const cardAnim = useSlideUp(600, 100, 40);
  const buttonAnim = useSlideUp(600, 200, 30);

  // Picker modal states
  const [countryPickerVisible, setCountryPickerVisible] = React.useState(false);
  const [civilStatusPickerVisible, setCivilStatusPickerVisible] =
    React.useState(false);
  const [cityPickerVisible, setCityPickerVisible] = React.useState(false);
  const [hobbyPickerVisible, setHobbyPickerVisible] = React.useState(false);

  // Auto-calculate age from birthday
  React.useEffect(() => {
    if (values.birthday) {
      const age = calculateAge(values.birthday);
      if (age !== null && age !== values.age) {
        setFieldValue("age", age.toString());
      }
    }
  }, [values.birthday]);

  const calculateAge = (dateString: string): number | null => {
    if (!dateString) return null;

    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (!dateRegex.test(dateString)) return null;

    const [month, day, year] = dateString.split("/").map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age : null;
  };

  // Calculate field completion for progress indicator
  const calculateCompletion = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "nickName",
      "birthday",
      "age",
      "country",
      "civilStatus",
      "city",
      "hobby",
    ];
    const completedFields = requiredFields.filter(
      (field) => values[field] && values[field].toString().trim() !== ""
    ).length;
    return { completed: completedFields, total: requiredFields.length };
  };

  const completion = calculateCompletion();
  const isFormComplete = completion.completed === completion.total;

  const handleNext = async () => {
    // First, mark all fields as touched so errors show
    setTouched({
      firstName: true,
      lastName: true,
      nickName: true,
      birthday: true,
      age: true,
      country: true,
      civilStatus: true,
      city: true,
      hobby: true,
    });

    // Then validate
    // const validationErrors = await validateForm();
    // console.log("🔥 validationErrors:", validationErrors);

    // if (Object.keys(validationErrors).length === 0) {
    //   navigation.navigate("Step2");
    // }
    navigation.navigate("Step2");
  };

  return (
    <FullScreen statusBarStyle="dark">
      <LinearGradient
        colors={["#C8E6E2", "#FFE2C1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView edges={["top"]} style={styles.headerView}>
        <ProgressBar step={1} total={3} />

        {/* ANIMATED HEADER & LOGO */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim.opacity,
              transform: [{ translateY: headerAnim.translateY }],
            },
          ]}
        >
          <Image
            source={require("../../assets/icons/tander-logo.png")}
            style={styles.logo}
          />
          <Text style={styles.title}>Welcome to Tander</Text>
          <Text style={styles.subtitle}>
            Complete your registration to join Tander for social connections,
            companionship, and dating.
          </Text>
        </Animated.View>
        {/* Completion Indicator */}
        <Animated.View
          style={[
            styles.completionIndicator,
            {
              opacity: headerAnim.opacity,
              transform: [{ translateY: headerAnim.translateY }],
            },
          ]}
        >
          <View style={styles.completionRow}>
            <Ionicons
              name={
                isFormComplete
                  ? "checkmark-circle"
                  : "information-circle-outline"
              }
              size={18}
              color={isFormComplete ? colors.success : colors.textSecondary}
            />
            <Text style={styles.completionText}>
              {completion.completed} of {completion.total} fields completed
            </Text>
          </View>
          {!isFormComplete && (
            <Text style={styles.completionHint}>All fields are required</Text>
          )}
        </Animated.View>
      </SafeAreaView>
      <View style={styles.wrapper}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ANIMATED BASIC INFO CARD */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardAnim.opacity,
                transform: [{ translateY: cardAnim.translateY }],
              },
            ]}
          >
            <Text style={styles.cardTitle}>Basic Info</Text>

            {/* FIRST NAME */}
            <TextInputField
              label="First Name *"
              placeholder="Enter your first name"
              value={values.firstName}
              touched={!!touched.firstName}
              error={getErrorString(errors.firstName)}
              onChangeText={(t) => setFieldValue("firstName", t)}
              onBlur={() => setFieldTouched("firstName", true)}
            />

            {/* LAST NAME */}
            <TextInputField
              label="Last Name *"
              placeholder="Enter your last name"
              value={values.lastName}
              touched={!!touched.lastName}
              error={getErrorString(errors.lastName)}
              onChangeText={(t) => setFieldValue("lastName", t)}
              onBlur={() => setFieldTouched("lastName", true)}
            />

            {/* NICKNAME */}
            <TextInputField
              label="Nickname *"
              placeholder="How should we call you?"
              value={values.nickName}
              touched={!!touched.nickName}
              error={getErrorString(errors.nickName)}
              onChangeText={(t) => setFieldValue("nickName", t)}
              onBlur={() => setFieldTouched("nickName", true)}
            />

            {/* BIRTHDAY + AGE (2-column layout) */}
            <View style={styles.row}>
              <View style={styles.col}>
                <DatePickerInput
                  label="Birthday *"
                  placeholder="Select date"
                  value={values.birthday}
                  touched={!!touched.birthday}
                  error={getErrorString(errors.birthday)}
                  onChangeText={(date) => setFieldValue("birthday", date)}
                  onBlur={() => setFieldTouched("birthday", true)}
                />
              </View>

              <View style={styles.col}>
                <View style={styles.ageContainer}>
                  <Text style={styles.label}>Age</Text>
                  <View style={styles.ageDisplay}>
                    <Text style={styles.ageText}>{values.age || "—"}</Text>
                    {values.age && <Text style={styles.ageUnit}>years</Text>}
                  </View>
                  {values.age && (
                    <Text style={styles.autoCalculated}>Auto-calculated</Text>
                  )}
                </View>
              </View>
            </View>

            {/* COUNTRY + CIVIL STATUS */}
            <View style={styles.row}>
              <View style={styles.col}>
                <SelectField
                  label="Country *"
                  placeholder="Select country"
                  value={values.country}
                  touched={!!touched.country}
                  error={getErrorString(errors.country)}
                  onPress={() => setCountryPickerVisible(true)}
                />
              </View>

              <View style={styles.col}>
                <SelectField
                  label="Civil Status *"
                  placeholder="Select status"
                  value={values.civilStatus}
                  touched={!!touched.civilStatus}
                  error={getErrorString(errors.civilStatus)}
                  onPress={() => setCivilStatusPickerVisible(true)}
                />
              </View>
            </View>

            {/* CITY + HOBBY */}
            <View style={styles.row}>
              <View style={styles.col}>
                <SelectField
                  label="City/Province *"
                  placeholder="Select city"
                  value={values.city}
                  touched={!!touched.city}
                  error={getErrorString(errors.city)}
                  onPress={() => setCityPickerVisible(true)}
                />
              </View>

              <View style={styles.col}>
                <SelectField
                  label="Hobby *"
                  placeholder="Select hobby"
                  value={values.hobby}
                  touched={!!touched.hobby}
                  error={getErrorString(errors.hobby)}
                  onPress={() => setHobbyPickerVisible(true)}
                />
              </View>
            </View>
          </Animated.View>

          {/* Spacer for bottom navigation */}
          <View style={{ height: 20 }} />
        </ScrollView>

        {/* ANIMATED Bottom Navigation */}
        <Animated.View
          style={[
            styles.bottomNav,
            {
              opacity: buttonAnim.opacity,
              transform: [{ translateY: buttonAnim.translateY }],
            },
          ]}
        >
          {/* Next Button (no back button on step 1) */}
          <TouchableOpacity
            style={[
              styles.nextButton,
              !isFormComplete && styles.nextButtonMuted,
            ]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.nextText, !isFormComplete && styles.nextTextMuted]}
            >
              {isFormComplete ? "Continue to Photos" : "Complete All Fields"}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isFormComplete ? colors.white : "#9CA3AF"}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* PICKER MODALS */}
        <PickerModal
          visible={countryPickerVisible}
          title="Select Country"
          options={COUNTRIES}
          selectedValue={values.country}
          onSelect={(value) => {
            setFieldValue("country", value);
            setFieldTouched("country", true);
          }}
          onClose={() => setCountryPickerVisible(false)}
          searchPlaceholder="Search country..."
        />

        <PickerModal
          visible={civilStatusPickerVisible}
          title="Select Civil Status"
          options={CIVIL_STATUS_OPTIONS}
          selectedValue={values.civilStatus}
          onSelect={(value) => {
            setFieldValue("civilStatus", value);
            setFieldTouched("civilStatus", true);
          }}
          onClose={() => setCivilStatusPickerVisible(false)}
          enableSearch={false}
        />

        <PickerModal
          visible={cityPickerVisible}
          title="Select City/Province"
          options={PHILIPPINES_CITIES}
          selectedValue={values.city}
          onSelect={(value) => {
            setFieldValue("city", value);
            setFieldTouched("city", true);
          }}
          onClose={() => setCityPickerVisible(false)}
          searchPlaceholder="Search city..."
        />

        <PickerModal
          visible={hobbyPickerVisible}
          title="Select Hobby"
          options={HOBBY_OPTIONS}
          selectedValue={values.hobby}
          onSelect={(value) => {
            setFieldValue("hobby", value);
            setFieldTouched("hobby", true);
          }}
          onClose={() => setHobbyPickerVisible(false)}
          searchPlaceholder="Search hobby..."
        />
      </View>
    </FullScreen>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    // backgroundColor: colors.backgroundLight,
  },

  container: {
    flex: 1,
    padding: 20,
    // backgroundColor: colors.backgroundLight,
  },
  headerView: {
    padding: 20,
    // backgroundColor: colors.backgroundLight,
  },

  header: {
    alignItems: "center",
    marginBottom: 16,
  },

  logo: {
    width: 36,
    height: 36,
    marginBottom: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
    color: colors.textPrimary,
  },

  subtitle: {
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    width: "95%",
    fontSize: 14,
  },

  completionIndicator: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },

  completionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  completionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  completionHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginLeft: 26,
  },

  card: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
    elevation: 3,
    shadowColor: colors.shadowMedium,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: colors.textPrimary,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  col: {
    flex: 1,
  },

  ageContainer: {
    marginBottom: 18,
  },

  label: {
    fontWeight: "600",
    marginBottom: 6,
    fontSize: 14,
    color: colors.textPrimary,
  },

  ageDisplay: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1.5,
    borderColor: colors.borderMedium,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 6,
  },

  ageText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },

  ageUnit: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  autoCalculated: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: "center",
  },

  // Bottom Navigation
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,

    shadowColor: colors.shadowMedium,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 4,
  },

  nextButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,

    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },

  nextButtonMuted: {
    backgroundColor: colors.borderMedium,
    shadowOpacity: 0.05,
    elevation: 0,
  },

  nextText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "700",
  },

  nextTextMuted: {
    color: "#9CA3AF",
  },
});
