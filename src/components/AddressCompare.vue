<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
        <div class="flex items-center gap-3 mb-6">
          <Navigation class="w-8 h-8 text-indigo-600" />
          <h1 class="text-3xl font-bold text-gray-900">Address Comparison Tool</h1>
        </div>
        <p class="text-gray-600 mb-8">Compare commute times from your current and potential new addresses</p>

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
                  <div class="text-sm">
                    <div class="font-medium">🚗 {{ result.current.driveTime }} ({{ result.current.distance }})</div>
                    <div class="text-gray-600">🚶 {{ result.current.walkTime }}</div>
                  </div>
                </td>
                <td v-if="result.new" class="py-4 px-4">
                  <div class="text-sm">
                    <div class="font-medium">🚗 {{ result.new.driveTime }} ({{ result.new.distance }})</div>
                    <div class="text-gray-600">🚶 {{ result.new.walkTime }}</div>
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
import { ref } from 'vue';
import { MapPin, Plus, X, Navigation } from 'lucide-vue-next';
import { useGoogleMaps } from '../composables/useGoogleMaps';

const { loadGoogleMaps } = useGoogleMaps();

const currentAddress = ref('');
const newAddress = ref('');
const destinations = ref([{ id: 1, label: '', address: '' }]);
const results = ref(null);
const loading = ref(false);
const error = ref('');

const addDestination = () => {
  destinations.value.push({ id: Date.now(), label: '', address: '' });
};

const removeDestination = (id) => {
  destinations.value = destinations.value.filter(d => d.id !== id);
};

const calculateDistances = async () => {
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

    const request = {
      origins: origins,
      destinations: destAddresses,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.IMPERIAL,
    };

    service.getDistanceMatrix(request, async (response, status) => {
      if (status === 'OK') {
        // Get walking times too
        const walkRequest = {
          ...request,
          travelMode: google.maps.TravelMode.WALKING,
        };

        service.getDistanceMatrix(walkRequest, (walkResponse, walkStatus) => {
          if (walkStatus === 'OK') {
            const resultData = destinations.value.map((dest, idx) => {
              const currentDrive = response.rows[0].elements[idx];
              const currentWalk = walkResponse.rows[0].elements[idx];
              const newDrive = newAddress.value ? response.rows[1].elements[idx] : null;
              const newWalk = newAddress.value ? walkResponse.rows[1].elements[idx] : null;

              return {
                label: dest.label || `Destination ${idx + 1}`,
                address: dest.address,
                current: {
                  driveTime: currentDrive.status === 'OK' ? currentDrive.duration.text : 'N/A',
                  distance: currentDrive.status === 'OK' ? currentDrive.distance.text : 'N/A',
                  walkTime: currentWalk.status === 'OK' ? currentWalk.duration.text : 'N/A',
                },
                new: newAddress.value ? {
                  driveTime: newDrive && newDrive.status === 'OK' ? newDrive.duration.text : 'N/A',
                  distance: newDrive && newDrive.status === 'OK' ? newDrive.distance.text : 'N/A',
                  walkTime: newWalk && newWalk.status === 'OK' ? newWalk.duration.text : 'N/A',
                } : null
              };
            });

            results.value = resultData;
            loading.value = false;
          }
        });
      } else {
        error.value = 'Failed to calculate distances. Please check your addresses.';
        loading.value = false;
      }
    });
  } catch (err) {
    error.value = 'An error occurred. Please try again.';
    loading.value = false;
  }
};
</script>

<style scoped>
/* Tailwind classes are used inline, no additional styles needed */
</style>
