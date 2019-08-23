
exports.up = function(knex) {
    return knex.schema.createTable('users', table => {
       table.increments();
       table.string('username', 128);
       table.string('password'); 
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('users');
};
