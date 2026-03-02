<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
        <div class="flex items-center justify-between gap-3 mb-6">
          <div
            class="flex items-center gap-3 cursor-pointer group transition-transform hover:scale-[1.02]"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="handleDrop"
          >
            <Navigation
              class="w-8 h-8 text-indigo-600 transition-all duration-300"
              :class="{ 'text-green-500 scale-125 rotate-12': dragOver }"
            />
            <h1
              class="text-3xl font-bold text-gray-900 select-none transition-colors duration-300"
              :class="{ 'text-green-600': dragOver }"
            >
              Address Comparison Tool
            </h1>
          </div>
          <button
            @click="exportData"
            title="Download addresses as JSON"
            class="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <Download class="w-6 h-6" />
          </button>
        </div>
        <p class="text-gray-600 mb-8">Compare commute times from your current and potential new addresses</p>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Transportation Modes *
          </label>
          <div class="flex flex-wrap gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="transportModes.walking"
                class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span class="text-gray-700">🚶 Walking</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="transportModes.transit"
                class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span class="text-gray-700">🚇 Public Transportation</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="transportModes.driving"
                class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span class="text-gray-700">🚗 Driving</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="transportModes.bicycling"
                class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
              />
              <span class="text-gray-700">🚴 Bicycle</span>
            </label>
          </div>
        </div>

        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Current Address *
            </label>
            <input
              type="text"
              v-model="currentAddress"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Potential New Address (optional)
            </label>
            <input
              type="text"
              v-model="newAddress"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-3">
              <label class="block text-sm font-medium text-gray-700">
                Destinations *
              </label>
              <button
                @click="addDestination"
                class="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Plus class="w-4 h-4" />
                Add Destination
              </button>
            </div>

            <div class="space-y-3">
              <div v-for="dest in destinations" :key="dest.id" class="flex gap-3">
                <input
                  type="text"
                  v-model="dest.label"
                  placeholder="Label (e.g., Work, Gym)"
                  class="w-1/3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <input
                  type="text"
                  v-model="dest.address"
                  placeholder="Address"
                  class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  v-if="destinations.length > 1"
                  @click="removeDestination(dest.id)"
                  class="p-3 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {{ error }}
          </div>

          <button
            @click="calculateDistances"
            :disabled="loading"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Calculating...' : 'Compare Addresses' }}
          </button>
        </div>
      </div>

      <div v-if="results" class="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Results</h2>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b-2 border-gray-200">
                <th class="text-left py-3 px-4 font-semibold text-gray-700">Destination</th>
                <th class="text-left py-3 px-4 font-semibold text-gray-700">From Current Address</th>
                <th v-if="newAddress" class="text-left py-3 px-4 font-semibold text-gray-700">From New Address</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(result, idx) in results" :key="idx" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-4 px-4">
                  <div class="flex items-center gap-2">
                    <MapPin class="w-4 h-4 text-indigo-600" />
                    <div>
                      <div class="font-medium text-gray-900">{{ result.label }}</div>
                      <div class="text-sm text-gray-500">{{ result.address }}</div>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-4">
                  <div class="text-sm space-y-1">
                    <div v-for="(modeData, modeName) in result.current" :key="modeName" class="font-medium">
                      {{ modeData.emoji }} {{ modeData.time }} ({{ modeData.distance }})
                    </div>
                  </div>
                </td>
                <td v-if="result.new" class="py-4 px-4">
                  <div class="text-sm space-y-1">
                    <div v-for="(modeData, modeName) in result.new" :key="modeName" class="font-medium">
                      {{ modeData.emoji }} {{ modeData.time }} ({{ modeData.distance }})
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-6 text-center text-sm text-gray-600">
        <p>Powered by Google Maps API</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { MapPin, Plus, X, Navigation, Download } from 'lucide-vue-next';
import { useGoogleMaps } from '../composables/useGoogleMaps';

const { loadGoogleMaps } = useGoogleMaps();

const STORAGE_KEY = 'whatifimoved_data';

const currentAddress = ref('');
const newAddress = ref('');
const destinations = ref([{ id: 1, label: '', address: '' }]);
const results = ref(null);
const loading = ref(false);
const error = ref('');
const dragOver = ref(false);
const transportModes = ref({
  walking: false,
  transit: false,
  driving: true, // default checked
  bicycling: false
});

// Persistence
const loadFromStorage = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      applyData(data);
    } catch (e) {
      console.error('Failed to load from storage', e);
    }
  }
};

const applyData = (data) => {
  if (data.currentAddress !== undefined) currentAddress.value = data.currentAddress;
  if (data.newAddress !== undefined) newAddress.value = data.newAddress;
  if (data.destinations) destinations.value = data.destinations;
  if (data.transportModes) transportModes.value = { ...transportModes.value, ...data.transportModes };
};

watch([currentAddress, newAddress, destinations, transportModes], () => {
  const data = {
    currentAddress: currentAddress.value,
    newAddress: newAddress.value,
    destinations: destinations.value,
    transportModes: transportModes.value
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}, { deep: true });

// File handling
const handleDrop = (e) => {
  dragOver.value = false;
  const file = e.dataTransfer.files[0];
  if (file && file.type === 'application/json') {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        applyData(data);
      } catch (err) {
        error.value = 'Failed to parse JSON file';
      }
    };
    reader.readAsText(file);
  }
};

const exportData = () => {
  const data = {
    currentAddress: currentAddress.value,
    newAddress: newAddress.value,
    destinations: destinations.value,
    transportModes: transportModes.value
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'whatifimoved.json';
  a.click();
  URL.revokeObjectURL(url);
};

// Check for API key on mount and warn developers
onMounted(() => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here' || apiKey === 'YOUR_API_KEY_HERE') {
    console.warn('⚠️  Google Maps API key not configured!');
    console.info('To fix: Add VITE_GOOGLE_MAPS_API_KEY to your .env file and restart the dev server.');
    console.info('See .env.example for details.');
  }
  loadFromStorage();
});

const addDestination = () => {
  destinations.value.push({ id: Date.now(), label: '', address: '' });
};

const removeDestination = (id) => {
  destinations.value = destinations.value.filter(d => d.id !== id);
};

const calculateDistances = async () => {
  // Validate at least one transportation mode is selected
  const hasSelectedMode = Object.values(transportModes.value).some(mode => mode);
  if (!hasSelectedMode) {
    error.value = 'Please select at least one transportation mode';
    return;
  }

  if (!currentAddress.value || destinations.value.some(d => !d.address)) {
    error.value = 'Please fill in all addresses';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    // Load Google Maps API first
    await loadGoogleMaps();

    const service = new google.maps.DistanceMatrixService();

    const origins = [currentAddress.value];
    if (newAddress.value) origins.push(newAddress.value);

    const destAddresses = destinations.value.map(d => d.address);

    // Map mode names to Google Maps API constants and emojis
    const modeConfig = {
      walking: { api: google.maps.TravelMode.WALKING, emoji: '🚶', label: 'Walking' },
      transit: { api: google.maps.TravelMode.TRANSIT, emoji: '🚇', label: 'Transit' },
      driving: { api: google.maps.TravelMode.DRIVING, emoji: '🚗', label: 'Driving' },
      bicycling: { api: google.maps.TravelMode.BICYCLING, emoji: '🚴', label: 'Bicycling' }
    };

    // Get selected modes
    const selectedModes = Object.entries(transportModes.value)
      .filter(([_, isSelected]) => isSelected)
      .map(([mode, _]) => mode);

    // Make API calls for each selected mode
    const modePromises = selectedModes.map(mode => {
      return new Promise((resolve, reject) => {
        const request = {
          origins: origins,
          destinations: destAddresses,
          travelMode: modeConfig[mode].api,
          unitSystem: google.maps.UnitSystem.IMPERIAL,
        };

        service.getDistanceMatrix(request, (response, status) => {
          if (status === 'OK') {
            resolve({ mode, response });
          } else {
            reject(new Error(`Failed to get ${mode} data`));
          }
        });
      });
    });

    // Wait for all API calls to complete
    const modeResults = await Promise.all(modePromises);

    // Process results
    const resultData = destinations.value.map((dest, idx) => {
      const result = {
        label: dest.label || `Destination ${idx + 1}`,
        address: dest.address,
        current: {},
        new: newAddress.value ? {} : null
      };

      // Add data for each selected mode
      modeResults.forEach(({ mode, response }) => {
        const currentElement = response.rows[0].elements[idx];
        const config = modeConfig[mode];

        result.current[mode] = {
          time: currentElement.status === 'OK' ? currentElement.duration.text : 'N/A',
          distance: currentElement.status === 'OK' ? currentElement.distance.text : 'N/A',
          emoji: config.emoji,
          label: config.label
        };

        if (newAddress.value) {
          const newElement = response.rows[1].elements[idx];
          result.new[mode] = {
            time: newElement.status === 'OK' ? newElement.duration.text : 'N/A',
            distance: newElement.status === 'OK' ? newElement.distance.text : 'N/A',
            emoji: config.emoji,
            label: config.label
          };
        }
      });

      return result;
    });

    results.value = resultData;
    loading.value = false;
  } catch (err) {
    console.error('Error calculating distances:', err);
    error.value = err.message || 'Failed to calculate distances. Please check your addresses.';
    loading.value = false;
  }
};
</script>

<style scoped>
/* Tailwind classes are used inline, no additional styles needed */
</style>
