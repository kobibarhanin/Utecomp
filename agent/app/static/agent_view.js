jQuery.ajaxSettings.traditional = true;


$(document).ready(function () {

    populate_jobs();
    setInterval(populate_jobs,5000);
    get_connectivity();
    setInterval(get_connectivity,5000);
    get_logs();
    setInterval(get_logs,5000);

    $("form#job_form").submit(function(e) {
        e.preventDefault();
        var formData = new FormData(this);
        $.ajax({
            url: '/submit',
            type: 'POST',
            data: formData,
            success: function (data) {
                if (data['status']=='disabled'){
                    alert('this agent is disabled, try again later');
                    return
                }
                populate_jobs();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert(xhr.status);
                alert(xhr.responseText);
            },
            cache: false,
            contentType: false,
            processData: false
        });
    });
});


function get_logs(){
    $.getJSON('/logs',{},function(logs){
        $('#log_flow').html(logs)
    });
}


function get_connectivity(){
    $.getJSON('/connectivity',{},function(connectivity){
        if(connectivity['status']=='connected'){
            classColor='green';
        }
        else if (connectivity['status']=='disconnected'){
            classColor='red';
        }
        else {
            classColor='orange';
        }
        $('#connectivity').html('<div class="ui '+classColor+' big label">'+connectivity['status']+'</div>')
    });
}


function populate_jobs(){

    $.getJSON('/jobs_submitted',{},function(jobs){
        $("#tbodyid").empty();
        $.each(jobs, function(i, job) {
            job = jobs[i]
            entry = {
                'executable': job['payload'],
                'id': job['id'],
                'agent': job['assigned_agent']['name'],
                'start': job['submission_time'],
                'end': '-',
                'status': job['status']
            }
            if (entry['status']=='submitted'){
                classColor = 'orange';
            }
            else if (entry['status']=='completed'){
                classColor = 'green';
                entry['end']=job['completion_time']
            } else if (entry['status']=='Terminated'){
                classColor = 'red';
            }
            $('#jobs_table').append('<tr><td>'+entry['executable']+'</td><td>'+entry['id']+'</td><td>'+entry['agent']+'</td><td>'+entry['start']+'</td><td>'+entry['end']+'</td><td><a href="/get_report?id='+entry['id']+'" id="'+entry['id']+'"class="ui '+classColor+' label">'+entry['status']+'</a></td></tr>');
        });

    });

    $.getJSON('/jobs_executed',{},function(jobs){
        $("#tbodyid_exec").empty();
        $.each(jobs, function(i, job) {
            job = jobs[i]
            entry = {
                'executable': job['filename'],
                'id': job['id'],
                'agent': '-',
                'start': '-',
                'end': '-',
                'status': job['status']
            }
            if (entry['status']=='received'){
                classColor = 'orange';
            }
            else if (entry['status']=='completed'){
                classColor = 'green';
                entry['end']=job['completion_time']
            } else if (entry['status']=='aborted'){
                classColor = 'red';
            }
            $('#jobs_table_exec').append('<tr><td>'+entry['executable']+'</td><td>'+entry['id']+'</td><td>'+entry['agent']+'</td><td>'+entry['start']+'</td><td>'+entry['end']+'</td><td><a href="/get_report?id='+entry['id']+'" id="'+entry['id']+'"class="ui '+classColor+' label">'+entry['status']+'</a></td></tr>');
        });
    });

    $.getJSON('/jobs_orchestrated',{},function(jobs){
        $("#tbodyid_orch").empty();
        $.each(jobs, function(i, job) {
            job = jobs[i];
            let entry = {
                'executable': job['filename'],
                'id': job['job_id'],
                'agent': job['name'],
                'start': job['submission_time'],
                'end': '-',
                'agent_status': job['agent_status'],
                'job_status': job['job_status']
            };
            let classColor;
            if (entry['agent_status'] === 'connected') {
                status = 'connected';
                classColor = 'green';
            } else if (entry['agent_status'] === 'disconnected') {
                status = 'disconnected';
                classColor = 'red';
            } else if (entry['agent_status'] === 'offline') {
                status = entry['agent_status'];
                classColor = 'grey';
            } else if (entry['agent_status'] == null) {
                status = 'loading';
                classColor = 'grey';
            } else {
                status = entry['agent_status'];
                classColor = 'orange';
            }

            let job_class_color = resolve_job_status(entry);

            $('#jobs_table_orch').append('<tr><td>'+entry['executable']+'</td><td>'+entry['id']+'</td><td>'+entry['agent']+'</td><td>'+entry['start']+'</td><td>'+entry['end']+'</td><td><label class="ui '+classColor+' label">'+entry['agent_status']+'</label></td><td><label class="ui '+job_class_color+' label">'+entry['job_status']+'</label></td></tr>');
        });
    });
}

function resolve_job_status(entry){
    let classColor;
    if (entry['job_status'] == 'received') {
        classColor = 'orange';
    } else if (entry['job_status'] == 'completed') {
        classColor = 'green';
    } else if (entry['job_status'] == 'aborted') {
        classColor = 'red';
    }
    return classColor
}