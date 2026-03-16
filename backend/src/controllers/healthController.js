class HealthController {
    async health(req, res) {
        res.json({massage: "beckend work nice"})
    }
}

module.exports = new HealthController();