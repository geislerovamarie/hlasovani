/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex.schema.createTable("options", (table) => {
    table.increments("id")
    table.string("title").notNullable()
    table.integer("poll_id").notNullable()
    table.integer("votes_count").defaultTo(0)
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex.schema.dropTable("options")
}
