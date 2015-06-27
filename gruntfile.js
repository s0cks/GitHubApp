module.exports = function(grunt){
    grunt.initConfig({
        nodewebkit:{
            options:{
                platforms: ["win", "osx", "linux"],
                macZip: false,
                builderDir: "./builds"
            },
            src: [
                "./**/*"
            ]
        }
    });
    grunt.loadNpmTasks("grunt-node-webkit-builder");
};