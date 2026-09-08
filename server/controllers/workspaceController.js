const supabase = require('../config/supabaseClient');
const crypto = require('crypto');

const uploadImage = async (req, res) => {
    try {
        const file = req.file;
        const eventId = req.params.id;

        if (!file) {
            return res.status(400).json({ status: 'Error', message: 'No image uploaded' });
        }

        // Validate MIME type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({ status: 'Error', message: 'Only images (JPEG, PNG, WEBP, GIF) are allowed' });
        }

        const ext = file.originalname.split('.').pop() || 'png';
        const filename = `${eventId}/${crypto.randomUUID()}.${ext}`;

        const { data, error } = await supabase
            .storage
            .from('workspace_assets')
            .upload(filename, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) {
            console.error('[Upload Error]:', error);
            return res.status(500).json({ status: 'Error', message: 'Failed to upload image' });
        }

        const { data: publicData } = supabase
            .storage
            .from('workspace_assets')
            .getPublicUrl(filename);

        return res.status(200).json({
            status: 'Success',
            url: publicData.publicUrl
        });

    } catch (err) {
        console.error('[Workspace Controller Error]:', err);
        return res.status(500).json({ status: 'Error', message: 'Internal Server Error' });
    }
};

module.exports = { uploadImage };
