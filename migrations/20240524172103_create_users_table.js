
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
    await knex.schema.createTable('users', (table) => {
        table.increments('id')
        table.string('login').notNullable().unique()
        table.string('hash').notNullable()
        table.string('salt').notNullable()
        table.string('token')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
    await knex.schema.dropTable('users')
};
