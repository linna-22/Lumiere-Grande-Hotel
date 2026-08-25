<?php

namespace Database\Factories;

use App\Models\Room_types;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Room_types>
 */
class Room_typesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    protected $model = Room_types::class;

    public function definition(): array
    {
        return [
           'name'        => $this->faker->randomElement(['Single Room', 'Double Room', 'Deluxe Suite', 'Presidential Suite']),
            'description' => $this->faker->sentence(),
            'capacity'      => $this->faker->numberBetween(1, 4),
            'base_price'    => $this->faker->randomFloat(2, 50, 300),
            'max_occupancy' => $this->faker->numberBetween(1, 4),
            'status'        => 'active',
        ];
    }
}
