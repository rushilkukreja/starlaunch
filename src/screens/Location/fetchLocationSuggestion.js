import database from '@react-native-firebase/database';

// Function to fetch location suggestions
export const fetchLocationSuggestions = async (input) => {
  const snapshot = await database()
    .ref('/locations') // The node where your locations are stored
    .once('value'); // Fetch all locations once

  const locations = [];
  snapshot.forEach(childSnapshot => {
    const locationData = childSnapshot.val();
    const nameMatch = locationData.Name.toLowerCase().includes(input.toLowerCase());
    const locationMatch = locationData.Location.toLowerCase().includes(input.toLowerCase());

    // If either name or location matches, add to suggestions
    if (nameMatch || locationMatch) {
      locations.push({
        id: childSnapshot.key, // Use the key as the unique identifier
        name: locationData.name,
        location: locationData.location,
      });
    }
  });

  return locations; // Return the array of matched locations
};
