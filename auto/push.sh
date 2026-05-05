if [ -z "$PUBLISH_SITE_TOKEN" ]; then
    echo "Error: PUBLISH_SITE_TOKEN is not set."
    exit 1
fi

if [ -z "$ORIGIN_IP" ]; then
    echo "Error: ORIGIN_IP is not set."
    exit 1
fi

curl --http1.1 -fsS -X POST "https://zihaofu245.me/__deploy/bookworm" \
    --resolve "zihaofu245.me:443:${ORIGIN_IP}" \
    -H "X-Publish-Token: ${PUBLISH_SITE_TOKEN}" \
    --data ''

exit 0