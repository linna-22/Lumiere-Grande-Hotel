<?php

namespace Database\Factories;

use App\Models\Room_types;
use App\Models\Rooms;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Rooms>
 */
class RoomsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    protected $model = Rooms::class;

    public function definition(): array
    {
        $testingData = [
            'https://plus.unsplash.com/premium_photo-1661964402307-02267d1423f5?q=80&w=1073&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1757524808357-01d16abdb1b1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            'https://images.unsplash.com/photo-1757524579381-4f0543ef0d63?q=80&w=1138&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        ];

        return [

        'room_number' => (string) $this->faker->unique()->numberBetween(105, 125),
        'room_type_id' => Room_types::inRandomOrder()->first()?->id?? Room_types::factory(),
        'floor' => $this->faker->numberBetween(1, 50),
        'status' => $this->faker->randomElement(['available', 'occupied', 'dirty', 'maintenance']) ,
        'description' => $this->faker->sentence(5),
        'image_url' => $this->faker->randomElement($testingData),
        'cloudinary_id' => null,
        
        ];
    }
}
