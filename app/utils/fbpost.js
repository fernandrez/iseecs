'use strict';

const db = require('../db');

module.exports = {
  findOne: x => {
    return db.fbpostModel.findOne({
      'fid': x
    })
  },
  findPaginated: (page, limit) => {
    return db.fbpostModel.paginate({},{ sort:'-created_time',page: page, limit: limit });
  },
  create: p => {
    return new Promise((resolve, reject) => {
      let n = new db.fbpostModel({
        fid: p.id,
        admin_creator:p.admin_creator,
        application:p.application,
        call_to_action:p.call_to_action,
        caption:p.caption,
        created_time:p.created_time,
        description:p.description,
        feed_targeting:p.feed_targeting,
        from:p.from,
        icon:p.icon,
        instagram_eligibility:p.instagram_eligibility,
        is_hidden:p.is_hidden,
        is_instagram_eligible:p.is_instagram_eligible,
        is_published:p.is_published,
        link:p.link,
        message:p.message,
        message_tags:p.message_tags,
        name:p.name,
        object_id:p.object_id,
        parent_id:p.parent_id,
        permalink_url:p.permalink_url,
        picture:p.picture,
        place:p.place,
        privacy:p.privacy,
        properties:p.properties,
        shares:p.shares,
        source:p.source,
        status_type:p.status_type,
        story:p.story,
        story_tags:p.story_tags,
        targeting:p.targeting,
        to:p.to,
        type:p.type,
        updated_time:p.updated_time,
        with_tags:p.with_tags
      });
      n.save(error => {
        if(error) {
          reject(error);
        } else {
          resolve(n);
        }
      });
    });
  },
  findById: id => {
    return new Promise((resolve, reject) => {
      db.fbpostModel.findById(id, (error, post) => {
        if(error) {
          reject(error);
        } else {
          resolve(post);
        }
      });
    });
  }
}
