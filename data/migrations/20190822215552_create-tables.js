
exports.up = function(knex) {
    knex.schema.createTable('users', table => {
       table.increments();
       table.string('username', 128);
       table.string('password'); 
    });
};

exports.down = function(knex) {
    knex.schema.dropTableIfExists('users');
};
