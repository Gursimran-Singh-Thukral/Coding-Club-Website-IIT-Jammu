/* 

    Project Controller 

    Handles the Submission, Retrieval and Review the of Tier-2 Coding Projects.

*/

const supabase = require('../db/supabaseClient');

const submitProject = async (req, res) => {

    try{

        // Extracting the Project Details

        const { title, description, github_link } = req.body;

        // Extracting the Student ID from MiddleWare

        const student_id = req.user.id;

        // Validation: Ensuring No Blank Submission

        if(!title || !description || !github_link){

            return res.status(400).json({

                status: 'Error',
                message: 'Bad Request: Title, Description and GitHub Link are all Required'

            });

        }

        // Inserting the Project into the Database

        const { data: newProject, error } = await supabase

            .from('projects')
            .insert([{

                student_id = student_id,
                title = title,
                description = description,
                github_link = github_link

            }])
            .select()
            .single();

        if(error) throw error;

        // Success Message

        return res.status(200).json({

            status: 'Success',
            message: 'Project Submitted Successfully. It is now in reviewing phase.',
            data: newProject

        });

    }

    catch(err){

        console.error("[Project Submission Error]: ", err.message);

        return res.status(500).json({

            status: 'Error',
            message: 'Internal Server Error while Submitting Project'

        });

    }

};

module.exports = { submitProject };