export const up = async (knex) => {
  return knex.schema.table('steps', (table) => {
    table.json('visual_position').nullable();
  });
};

export const down = async (knex) => {
  return knex.schema.table('steps', (table) => {
    table.dropColumn('visual_position');
  });
};