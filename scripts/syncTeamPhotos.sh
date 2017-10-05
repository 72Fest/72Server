#!/bin/bash
# there appeears to be issues with updated team logos
# this is a fix in the case of photos not updating
aws s3 cp ../public/images/teamlogos/ s3://72fest-photos-prod/teams/logos/ --recursive