// import { Pressable, StyleSheet, Text, View } from "react-native";

// export default function UploadBox({ count = 6 }) {
//   return (
//     <View style={styles.grid}>
//       {Array.from({ length: count }).map((_, i) => (
//         <Pressable key={i} style={styles.box}>
//           <Text style={{ fontSize: 24, color: "#999" }}>+</Text>
//         </Pressable>
//       ))}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   grid: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 10,
//     marginBottom: 10,
//   },
//   box: {
//     width: 80,
//     height: 80,
//     backgroundColor: "#F4F4F4",
//     borderRadius: 10,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface UploadBoxProps {
  count?: number; // number of upload slots
  value?: string[]; // current images (optional)
  onAddPhoto?: (photo: string) => void; // callback when user adds a photo
}

export default function UploadBox({
  count = 6,
  value = [],
  onAddPhoto,
}: UploadBoxProps) {
  const handleAdd = async () => {
    // Later: integrate ImagePicker
    const fakePhoto = "image-" + (value.length + 1); // placeholder
    onAddPhoto && onAddPhoto(fakePhoto);
  };

  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <Pressable key={i} style={styles.box} onPress={handleAdd}>
          {value[i] ? (
            <Image source={{ uri: value[i] }} style={styles.image} />
          ) : (
            <Text style={styles.plus}>+</Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  box: {
    width: 80,
    height: 80,
    backgroundColor: "#F4F4F4",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  plus: {
    fontSize: 30,
    color: "#AAA",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
